/**
 * Denormalized "flat" tables for the public dataset API.
 *
 * disbursement / revenue / production are normalized (period, location, fund, commodity
 * are FKs), which is awkward for public API consumers. These flat tables join the
 * readable labels into one row per record — a stable, self-describing surface that is a
 * normal read-only Directus collection, so it gets REST filtering/sorting/pagination,
 * Redis caching, and OpenAPI for free (no custom endpoints).
 *
 * They're rebuilt by `refresh_dataset_flat(<dataset>)`, called from the
 * revenue-data-update hook after each monthly import (dataset-scoped), so the API stays
 * in sync and Directus's CACHE_AUTO_PURGE clears stale responses. This migration also
 * does the initial populate.
 *
 * Notes: production has no `fund` and its measure is `volume` (bigint), not `amount`.
 * `legacy_*` columns are intentionally excluded (dropped post-migration). Public read is
 * granted wide-open (fields '*', no row filter) — the columns are all safe by design.
 */
const PUBLIC_POLICY = '$t:public_label';
const FLATS = ['disbursement_flat', 'revenue_flat', 'production_flat'];

const DDL = `
CREATE TABLE IF NOT EXISTS disbursement_flat (
  id uuid PRIMARY KEY,
  period_date date, calendar_year integer, fiscal_year integer, month_long varchar(255), period_type varchar(255),
  state varchar(255), state_name varchar(255), county varchar(255), land_category varchar(255), land_type varchar(255),
  fund_type varchar(255), fund_recipient varchar(255), fund_source varchar(255), disbursement_type varchar(255), revenue_type varchar(255),
  commodity varchar(255), product varchar(255),
  amount numeric(15,2), unit varchar(255)
);
CREATE INDEX IF NOT EXISTS disbursement_flat_period_date_idx ON disbursement_flat (period_date);
CREATE INDEX IF NOT EXISTS disbursement_flat_calendar_year_idx ON disbursement_flat (calendar_year);
CREATE INDEX IF NOT EXISTS disbursement_flat_state_name_idx ON disbursement_flat (state_name);
CREATE INDEX IF NOT EXISTS disbursement_flat_commodity_idx ON disbursement_flat (commodity);
CREATE INDEX IF NOT EXISTS disbursement_flat_fund_type_idx ON disbursement_flat (fund_type);
CREATE INDEX IF NOT EXISTS disbursement_flat_fund_recipient_idx ON disbursement_flat (fund_recipient);
CREATE INDEX IF NOT EXISTS disbursement_flat_fund_source_idx ON disbursement_flat (fund_source);

CREATE TABLE IF NOT EXISTS revenue_flat (
  id uuid PRIMARY KEY,
  period_date date, calendar_year integer, fiscal_year integer, month_long varchar(255), period_type varchar(255),
  state varchar(255), state_name varchar(255), county varchar(255), land_category varchar(255), land_type varchar(255),
  fund_type varchar(255), revenue_type varchar(255), fund_source varchar(255),
  commodity varchar(255), product varchar(255),
  amount numeric(15,2), unit varchar(255)
);
CREATE INDEX IF NOT EXISTS revenue_flat_period_date_idx ON revenue_flat (period_date);
CREATE INDEX IF NOT EXISTS revenue_flat_calendar_year_idx ON revenue_flat (calendar_year);
CREATE INDEX IF NOT EXISTS revenue_flat_state_name_idx ON revenue_flat (state_name);
CREATE INDEX IF NOT EXISTS revenue_flat_commodity_idx ON revenue_flat (commodity);
CREATE INDEX IF NOT EXISTS revenue_flat_revenue_type_idx ON revenue_flat (revenue_type);
CREATE INDEX IF NOT EXISTS revenue_flat_fund_source_idx ON revenue_flat (fund_source);

CREATE TABLE IF NOT EXISTS production_flat (
  id uuid PRIMARY KEY,
  period_date date, calendar_year integer, fiscal_year integer, month_long varchar(255), period_type varchar(255),
  state varchar(255), state_name varchar(255), county varchar(255), land_category varchar(255), land_type varchar(255),
  commodity varchar(255), product varchar(255), mineral_lease_type varchar(255),
  volume bigint, unit varchar(255)
);
CREATE INDEX IF NOT EXISTS production_flat_period_date_idx ON production_flat (period_date);
CREATE INDEX IF NOT EXISTS production_flat_calendar_year_idx ON production_flat (calendar_year);
CREATE INDEX IF NOT EXISTS production_flat_state_name_idx ON production_flat (state_name);
CREATE INDEX IF NOT EXISTS production_flat_commodity_idx ON production_flat (commodity);

CREATE OR REPLACE FUNCTION refresh_dataset_flat(p_dataset text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_dataset = 'disbursement' THEN
    TRUNCATE disbursement_flat;
    INSERT INTO disbursement_flat (id, period_date, calendar_year, fiscal_year, month_long, period_type, state, state_name, county, land_category, land_type, fund_type, fund_recipient, fund_source, disbursement_type, revenue_type, commodity, product, amount, unit)
    SELECT d.id, p.period_date, p.calendar_year, p.fiscal_year, p.month_long, p.type, l.state, l.state_name, l.county, l.land_category, l.land_type, f.type, f.recipient, f.source, f.disbursement_type, f.revenue_type, c.name, c.product, d.amount, d.unit
    FROM disbursement d
    LEFT JOIN period p ON d.period = p.id
    LEFT JOIN location l ON d.location = l.id
    LEFT JOIN fund f ON d.fund = f.id
    LEFT JOIN commodity c ON d.commodity = c.id;
  ELSIF p_dataset = 'revenue' THEN
    TRUNCATE revenue_flat;
    INSERT INTO revenue_flat (id, period_date, calendar_year, fiscal_year, month_long, period_type, state, state_name, county, land_category, land_type, fund_type, revenue_type, fund_source, commodity, product, amount, unit)
    SELECT r.id, p.period_date, p.calendar_year, p.fiscal_year, p.month_long, p.type, l.state, l.state_name, l.county, l.land_category, l.land_type, f.type, f.revenue_type, f.source, c.name, c.product, r.amount, r.unit
    FROM revenue r
    LEFT JOIN period p ON r.period = p.id
    LEFT JOIN location l ON r.location = l.id
    LEFT JOIN fund f ON r.fund = f.id
    LEFT JOIN commodity c ON r.commodity = c.id;
  ELSIF p_dataset = 'production' THEN
    TRUNCATE production_flat;
    INSERT INTO production_flat (id, period_date, calendar_year, fiscal_year, month_long, period_type, state, state_name, county, land_category, land_type, commodity, product, mineral_lease_type, volume, unit)
    SELECT pr.id, p.period_date, p.calendar_year, p.fiscal_year, p.month_long, p.type, l.state, l.state_name, l.county, l.land_category, l.land_type, c.name, c.product, c.mineral_lease_type, pr.volume, pr.unit
    FROM production pr
    LEFT JOIN period p ON pr.period = p.id
    LEFT JOIN location l ON pr.location = l.id
    LEFT JOIN commodity c ON pr.commodity = c.id;
  ELSE
    RAISE EXCEPTION 'refresh_dataset_flat: unknown dataset %', p_dataset;
  END IF;
END;
$$;
`;

async function publicPolicyId(knex) {
  const row = await knex('directus_policies').where({ name: PUBLIC_POLICY }).first('id');
  if (!row) throw new Error(`Public policy (${PUBLIC_POLICY}) not found — verify the policy name for this environment.`);
  return row.id;
}

module.exports = {
  async up(knex) {
    await knex.raw(DDL);

    // Register the flat tables as read-only Directus collections (fields are inferred
    // from the DB columns; no directus_fields rows needed).
    await knex('directus_collections')
      .insert([
        { collection: 'disbursement_flat', icon: 'table_view', note: 'Flat, denormalized disbursement rows for the public data API (rebuilt from the disbursement collection).', hidden: false, singleton: false },
        { collection: 'revenue_flat', icon: 'table_view', note: 'Flat, denormalized revenue rows for the public data API (rebuilt from the revenue collection).', hidden: false, singleton: false },
        { collection: 'production_flat', icon: 'table_view', note: 'Flat, denormalized production rows for the public data API (rebuilt from the production collection).', hidden: false, singleton: false },
      ])
      .onConflict('collection').ignore();

    // Public read, wide-open (matches the fact collections): fields '*', no row filter.
    const policy = await publicPolicyId(knex);
    await knex('directus_permissions').where({ policy, action: 'read' }).whereIn('collection', FLATS).del();
    await knex('directus_permissions').insert(
      FLATS.map((collection) => ({ policy, collection, action: 'read', fields: '*', permissions: null })),
    );

    // Initial populate.
    for (const ds of ['disbursement', 'revenue', 'production']) {
      await knex.raw('SELECT refresh_dataset_flat(?)', [ds]);
    }
  },

  async down(knex) {
    const policy = await publicPolicyId(knex);
    await knex('directus_permissions').where({ policy, action: 'read' }).whereIn('collection', FLATS).del();
    await knex('directus_collections').whereIn('collection', FLATS).del();
    await knex.raw('DROP FUNCTION IF EXISTS refresh_dataset_flat(text)');
    await knex.raw('DROP TABLE IF EXISTS disbursement_flat, revenue_flat, production_flat');
  },
};
