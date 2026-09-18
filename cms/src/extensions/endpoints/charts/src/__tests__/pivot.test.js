import { describe, it, expect } from 'vitest';
import { productionPivot } from '../collections/production.js';
import { revenuePivot } from '../collections/revenue.js';
import { federalSalesPivot, federalSalesTimeseries } from '../collections/federal-sales.js';
import { companyPivot } from '../collections/federal-revenue-by-company.js';

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
  for (const m of ['from', 'join', 'leftJoin', 'select', 'count', 'countDistinct', 'where', 'whereRaw', 'whereIn', 'groupByRaw', 'orderBy', 'distinct']) {
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

  it('breaks a commodity out into rows[] by the requested dimension (annual only)', async () => {
    const rows = [
      { dim: 'Oil', sub: 'Royalties', yr: 2020, amt: 700, cnt: 3 },
      { dim: 'Oil', sub: 'Rents', yr: 2020, amt: 300, cnt: 2 },
    ];
    const out = await revenuePivot(makeDb(rows, 5), { periodType: 'Fiscal Year', breakout: 'revenue_type' });
    expect(out.breakout).toBe('revenue_type');
    const oil = out.groups[0];
    expect(oil.rows.map((r) => r.key)).toEqual(['Royalties', 'Rents']); // rows sorted by total desc
    expect(oil.byYear).toEqual({ 2020: 1000 }); // commodity subtotal across breakout values
  });

  it('ignores the breakout for the monthly grain (month detail wins)', async () => {
    const rows = [{ dim: 'Oil', yr: 2020, mo: 1, amt: 5, cnt: 1 }];
    const out = await revenuePivot(makeDb(rows, 1), { periodType: 'Monthly', breakout: 'state' });
    expect(out.breakout).toBeNull();
    expect(out.groups[0].rows).toBeUndefined();
    expect(out.groups[0].months[0].monthName).toBe('January');
  });
});

describe('federalSalesPivot', () => {
  const measures = (sv, sval, rvpa, ta, pa, rvla) => ({
    sales_volume: sv, sales_value: sval, rvpa, ta, pa, rvla,
  });

  it('shapes commodities into measure columns, ranked by sales value, with grand totals', async () => {
    const rows = [
      { dim: 'Gas', ...measures(10, 100, 90, 5, 3, 82), cnt: 4 },
      { dim: 'Oil', ...measures(20, 500, 450, 20, 10, 420), cnt: 6 },
    ];
    const out = await federalSalesPivot(makeDb(rows, 10), {});
    expect(out.groupBy).toBe('commodity');
    expect(out.recordCount).toBe(10);
    expect(out.groups.map((g) => g.key)).toEqual(['Oil', 'Gas']); // sales_value desc
    expect(out.groups[0].values).toEqual(measures(20, 500, 450, 20, 10, 420));
    expect(out.totals).toEqual(measures(30, 600, 540, 25, 13, 502)); // summed across commodities
    expect(out.measures.map((m) => m.key)).toEqual(['sales_volume', 'sales_value', 'rvpa', 'ta', 'pa', 'rvla']);
  });

  it('groups null/empty commodity under "(none)" and merges them (data uses a literal label otherwise)', async () => {
    const rows = [
      { dim: null, ...measures(1, 10, 9, 1, 0, 8), cnt: 1 },
      { dim: '', ...measures(2, 20, 18, 1, 1, 16), cnt: 2 },
      { dim: 'Oil', ...measures(5, 50, 45, 2, 1, 42), cnt: 3 },
    ];
    const out = await federalSalesPivot(makeDb(rows, 6), {});
    const none = out.groups.find((g) => g.key === '(none)');
    expect(none).toBeTruthy();
    expect(none.values.sales_value).toBe(30); // null + '' merged
    expect(none.recordCount).toBe(3);
  });

  it('breaks a commodity out into rows[] by the requested dimension', async () => {
    const rows = [
      { dim: 'Oil', sub: 'Federal Onshore', ...measures(7, 70, 63, 3, 2, 58), cnt: 3 },
      { dim: 'Oil', sub: 'Federal Offshore', ...measures(3, 30, 27, 1, 1, 25), cnt: 2 },
    ];
    const out = await federalSalesPivot(makeDb(rows, 5), { breakout: 'land_type' });
    expect(out.breakout).toBe('land_type');
    const oil = out.groups[0];
    expect(oil.rows.map((r) => r.key)).toEqual(['Federal Onshore', 'Federal Offshore']); // by sales_value desc
    expect(oil.values.sales_value).toBe(100); // commodity subtotal across the breakout values
  });

  it('applies the calendar-year range, land type and region filters', async () => {
    const db = makeDb([], 0);
    await federalSalesPivot(db, { fromYear: 2019, toYear: 2023, landTypes: ['Federal Onshore'], regions: ['Wyoming'] });
    expect(called(db, 'where', (a) => a[0] === 'calendar_year' && a[1] === '>=' && a[2] === 2019)).toBe(true);
    expect(called(db, 'where', (a) => a[0] === 'calendar_year' && a[1] === '<=' && a[2] === 2023)).toBe(true);
    expect(called(db, 'whereRaw', (a) => String(a[0]).includes('CONCAT_WS'))).toBe(true); // land type expr
    expect(called(db, 'whereIn', (a) => a[0] === 'state_offshore_region')).toBe(true);
  });

  it('always restricts to the allowed commodities (excludes "Not Tied to a Commodity")', async () => {
    const db = makeDb([], 0);
    await federalSalesPivot(db, {}); // no commodity filter passed
    const base = db.calls.find((c) => c[0] === 'whereIn' && c[1] === 'commodity');
    expect(base).toBeTruthy();
    expect(base[2]).toEqual(['Oil', 'Gas', 'NGL']);
    expect(base[2]).not.toContain('Not Tied to a Commodity');
  });

  it('shapes a time series: sales_volume + RVLA arrays per commodity, aligned to years', async () => {
    const rows = [
      { commodity: 'Oil', calendar_year: 2020, sv: 100, rvla: 900 },
      { commodity: 'Oil', calendar_year: 2021, sv: 120, rvla: 950 },
      { commodity: 'Gas', calendar_year: 2021, sv: 40, rvla: 300 }, // no 2020 -> null gap
    ];
    const out = await federalSalesTimeseries(makeDb(rows), {});
    expect(out.years).toEqual([2020, 2021]);
    expect(out.commodities).toEqual(['Oil', 'Gas']); // allowed-order (Oil before Gas)
    expect(out.salesVolume.Oil).toEqual([100, 120]);
    expect(out.salesVolume.Gas).toEqual([null, 40]); // missing 2020 -> null
    expect(out.rvla.Oil).toEqual([900, 950]);
  });
});

describe('companyPivot', () => {
  it('shapes company rows into byYear + totalsByYear, ranked by total revenue', async () => {
    const rows = [
      { dim: 'Exxon', yr: 2021, amt: 300, cnt: 3 },
      { dim: 'Exxon', yr: 2022, amt: 330, cnt: 3 },
      { dim: 'Chevron', yr: 2021, amt: 200, cnt: 2 },
      { dim: 'Chevron', yr: 2022, amt: 220, cnt: 2 },
    ];
    const out = await companyPivot(makeDb(rows, 10), {});
    expect(out.groupBy).toBe('company');
    expect(out.years).toEqual([2021, 2022]);
    expect(out.recordCount).toBe(10);
    expect(out.groups.map((g) => g.key)).toEqual(['Exxon', 'Chevron']); // total desc
    const exxon = out.groups[0];
    expect(exxon.byYear).toEqual({ 2021: 300, 2022: 330 });
    expect(out.totalsByYear).toEqual({ 2021: 500, 2022: 550 });
    expect(out.truncated).toBe(false);
  });

  it('adds breakout sub-rows under each company (ranked by sub total)', async () => {
    const rows = [
      { dim: 'Exxon', yr: 2021, sub: 'Oil', amt: 120, cnt: 1 },
      { dim: 'Exxon', yr: 2021, sub: 'Gas', amt: 80, cnt: 1 },
    ];
    const out = await companyPivot(makeDb(rows, 2), { breakout: 'commodity' });
    expect(out.breakout).toBe('commodity');
    const exxon = out.groups[0];
    expect(exxon.rows.map((r) => r.key)).toEqual(['Oil', 'Gas']); // sub total desc
    expect(exxon.rows[0].byYear).toEqual({ 2021: 120 });
  });

  it('caps to the top 50 companies when no company filter is applied', async () => {
    // 51 distinct companies, one row each; the pivot keeps the top 50 and flags truncation.
    const rows = Array.from({ length: 51 }, (_, i) => ({ dim: `Co${i}`, yr: 2021, amt: 51 - i, cnt: 1 }));
    const out = await companyPivot(makeDb(rows, 51), {});
    expect(out.truncated).toBe(true);
    expect(out.shownCompanies).toBe(50);
    expect(out.totalCompanies).toBe(51);
    expect(out.groups).toHaveLength(50);
  });

  it('does NOT cap when specific companies are selected', async () => {
    const rows = Array.from({ length: 51 }, (_, i) => ({ dim: `Co${i}`, yr: 2021, amt: 1, cnt: 1 }));
    const out = await companyPivot(makeDb(rows, 51), { companies: ['Co0', 'Co1'] });
    expect(out.truncated).toBe(false);
    expect(out.groups).toHaveLength(51);
  });

  it('applies the year range and company/commodity/revenue-type filters', async () => {
    const db = makeDb([], 0);
    await companyPivot(db, { fromYear: 2021, toYear: 2023, companies: ['Exxon'], commodities: ['Oil'], revenueTypes: ['Royalties'] });
    expect(called(db, 'where', (a) => a[0] === 'calendar_year' && a[1] === '>=' && a[2] === 2021)).toBe(true);
    expect(called(db, 'where', (a) => a[0] === 'calendar_year' && a[1] === '<=' && a[2] === 2023)).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'corporate_name' && a[1].includes('Exxon'))).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'commodity' && a[1].includes('Oil'))).toBe(true);
    expect(called(db, 'whereIn', (a) => a[0] === 'revenue_type' && a[1].includes('Royalties'))).toBe(true);
  });
});
