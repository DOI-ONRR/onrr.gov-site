import { describe, it, expect } from 'vitest';
import { productionPivot } from '../collections/production.js';
import { revenuePivot } from '../collections/revenue.js';

// Minimal chainable knex mock: every builder method records its call and returns `this`;
// awaiting the builder resolves to `aggRows`; `.first()` resolves to the count row. This lets
// us feed fixture aggregate rows into the pivot shapers and also assert which filters/query
// methods were applied — without a database.
function makeDb(aggRows, countN = 0) {
  const calls = [];
  const db = {
    calls,
    raw: (s) => s,
    first: () => Promise.resolve({ n: countN }),
    then: (resolve, reject) => Promise.resolve(aggRows).then(resolve, reject),
  };
  for (const m of ['from', 'join', 'leftJoin', 'select', 'count', 'where', 'whereRaw', 'whereIn', 'groupByRaw', 'orderBy', 'distinct']) {
    db[m] = (...args) => { calls.push([m, ...args]); return db; };
  }
  return db;
}
const called = (db, method, pred) => db.calls.some((c) => c[0] === method && pred(c.slice(1)));

describe('productionPivot', () => {
  it('shapes annual rows into groups with byYear (no month detail)', async () => {
    const rows = [
      { dim: 'Gas (mcf)', yr: 2020, amt: 100, cnt: 9 },
      { dim: 'Gas (mcf)', yr: 2021, amt: 150, cnt: 9 },
      { dim: 'Oil (bbl)', yr: 2020, amt: 50, cnt: 3 },
    ];
    const out = await productionPivot(makeDb(rows, 21), { periodType: 'Fiscal Year' });
    expect(out.periodType).toBe('Fiscal Year');
    expect(out.years).toEqual([2020, 2021]);
    expect(out.recordCount).toBe(21);
    expect(out.grandTotal).toBe(300);
    const gas = out.groups.find((g) => g.key === 'Gas (mcf)');
    expect(gas.byYear).toEqual({ 2020: 100, 2021: 150 });
    expect(gas.months).toBeUndefined();
  });

  it('ranks groups by record count (breadth), not raw volume', async () => {
    // Oil has a bigger amount but fewer records; Gas has more records -> Gas ranks first.
    const rows = [
      { dim: 'Oil (bbl)', yr: 2020, amt: 1000, cnt: 2 },
      { dim: 'Gas (mcf)', yr: 2020, amt: 10, cnt: 50 },
    ];
    const out = await productionPivot(makeDb(rows, 52), { periodType: 'Fiscal Year' });
    expect(out.groups.map((g) => g.key)).toEqual(['Gas (mcf)', 'Oil (bbl)']);
  });

  it('adds ordered month detail for the monthly grain', async () => {
    const rows = [
      { dim: 'Gas (mcf)', yr: 2020, mo: 2, amt: 60, cnt: 1 },
      { dim: 'Gas (mcf)', yr: 2020, mo: 1, amt: 40, cnt: 1 },
    ];
    const out = await productionPivot(makeDb(rows, 2), { periodType: 'Monthly' });
    const gas = out.groups[0];
    expect(gas.months.map((m) => m.monthName)).toEqual(['January', 'February']);
    expect(gas.months[0].byYear).toEqual({ 2020: 40 });
    expect(gas.byYear).toEqual({ 2020: 100 });
  });

  it('groups by the breakout dimension into rows[] with a product subtotal', async () => {
    const rows = [
      { dim: 'Gas (mcf)', sub: 'Wyoming', yr: 2020, amt: 70, cnt: 3 },
      { dim: 'Gas (mcf)', sub: 'Texas', yr: 2020, amt: 30, cnt: 2 },
    ];
    const out = await productionPivot(makeDb(rows, 5), { periodType: 'Fiscal Year', breakout: 'state' });
    expect(out.breakout).toBe('state');
    const gas = out.groups[0];
    expect(gas.rows.map((r) => r.key)).toEqual(['Wyoming', 'Texas']); // rows sorted by total desc
    expect(gas.byYear).toEqual({ 2020: 100 }); // product subtotal across breakout values
  });

  it('applies the period, year-range, land, region and product filters', async () => {
    const db = makeDb([], 0);
    await productionPivot(db, {
      periodType: 'Fiscal Year', fromYear: 2019, toYear: 2021,
      landClasses: ['Federal'], landCategories: ['Onshore'], regions: ['Wyoming'], products: ['Gas (mcf)'],
    });
    expect(called(db, 'where', (a) => a[0] === 'p.type' && a[1] === 'Fiscal Year')).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'l.land_class')).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'l.land_category')).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'c.product')).toBe(true);
    expect(called(db, 'whereRaw', (a) => String(a[0]).includes('fiscal_year'))).toBe(true); // year range on fiscal_year
    expect(called(db, 'whereRaw', (a) => String(a[0]).includes('COALESCE'))).toBe(true); // region expr
  });
});

describe('revenuePivot', () => {
  it('ranks commodities by total revenue (single unit)', async () => {
    const rows = [
      { dim: 'Coal', yr: 2020, amt: 10, cnt: 100 },
      { dim: 'Oil', yr: 2020, amt: 1000, cnt: 2 },
    ];
    const out = await revenuePivot(makeDb(rows, 102), { periodType: 'Fiscal Year' });
    expect(out.groups.map((g) => g.key)).toEqual(['Oil', 'Coal']); // by total revenue, not record count
    expect(out.grandTotal).toBe(1010);
  });

  it('relabels empty/null commodity as "Not tied to a commodity" and merges them', async () => {
    const rows = [
      { dim: null, yr: 2020, amt: 500, cnt: 5 },
      { dim: '', yr: 2021, amt: 200, cnt: 2 },
      { dim: 'Oil', yr: 2020, amt: 50, cnt: 1 },
    ];
    const out = await revenuePivot(makeDb(rows, 8), { periodType: 'Fiscal Year' });
    const none = out.groups.find((g) => g.key === 'Not tied to a commodity');
    expect(none).toBeTruthy();
    expect(none.byYear).toEqual({ 2020: 500, 2021: 200 }); // null and '' merged into one group
  });

  it('filters by revenue type (fund.revenue_type) and region', async () => {
    const db = makeDb([], 0);
    await revenuePivot(db, { periodType: 'Calendar Year', revenueTypes: ['Royalties', 'Rents'], regions: ['Texas'] });
    expect(called(db, 'where', (a) => a[0] === 'p.type' && a[1] === 'Calendar Year')).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'f.revenue_type')).toBe(true);
    expect(called(db, 'whereRaw', (a) => String(a[0]).includes('COALESCE'))).toBe(true);
  });

  it('adds month detail for the monthly grain', async () => {
    const rows = [{ dim: 'Oil', yr: 2020, mo: 3, amt: 5, cnt: 1 }];
    const out = await revenuePivot(makeDb(rows, 1), { periodType: 'Monthly' });
    expect(out.periodType).toBe('Monthly');
    expect(out.groups[0].months[0].monthName).toBe('March');
  });
});
