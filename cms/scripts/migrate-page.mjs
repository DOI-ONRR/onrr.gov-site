#!/usr/bin/env node
/**
 * migrate-page.mjs — extract a single `pages` row and its full block closure from a
 * source Directus DB and emit portable SQL to recreate it in another instance.
 *
 * `pages` content lives behind polymorphic many-to-any (M2A) junctions:
 *   pages_page_blocks, pages_sidebar_blocks  → content/tab/card/expansion/layout/collection/
 *                                               chart/pay_gov/contact/data_table blocks
 *   card_blocks_card_content_blocks           → content/collection blocks   (nested in cards)
 *   expansion_panels_expansion_panel_blocks   → card/content/label/collection (nested)
 *   tab_blocks_tab_blocks                     → card/content/tab/... (nested, self-recursive)
 * plus chart_cards → chart_series (O2M) and pages.hub_chart (M2O).
 *
 * The junction map is discovered at runtime from directus_relations, so it adapts if the
 * block model changes. Starting at the page, we BFS the closure, then emit one .sql file:
 * INSERT ... ON CONFLICT (id) DO NOTHING for every collected row, wrapped in a transaction
 * that sets session_replication_role = replica so FK checks and the pages URL/other triggers
 * are bypassed (source values — including url — are preserved verbatim, order-independent).
 *
 * Each row is serialized server-side with to_jsonb() and re-materialized on import via
 * jsonb_populate_record(NULL::<table>, ...): types round-trip (uuid/jsonb/timestamptz/arrays),
 * and the rowtype is resolved against the TARGET, so columns the source has but the target
 * lacks are dropped and columns only the target has default to NULL (tolerates schema drift).
 *
 * NOT copied (warned instead — handle separately): dataset_metadata, handbook, hero_image
 * (a file row needs its S3 object too), and the parent page (must already exist in target,
 * or the parent FK dangles — it is preserved as-is here).
 *
 * Collections/columns absent from the source (e.g. an instance without hub_chart or
 * dataset_metadata) are detected and skipped with a warning rather than aborting the run.
 *
 * Usage:
 *   SOURCE_DSN='postgres://user:pass@host:5432/db' PAGE_ID='<uuid>' \
 *     node scripts/migrate-page.mjs > page.sql
 *   # add SOURCE_SSL=1 for a cloud.gov RDS tunnel (sslmode=require, cert not verified)
 * Then import into the target:
 *   docker exec -i database psql -U directus -d directus < page.sql
 */
import pkg from 'pg';
const { Client } = pkg;

const PAGE_ID = process.env.PAGE_ID || process.argv[2];
const SOURCE_DSN = process.env.SOURCE_DSN;
if (!PAGE_ID) { console.error('error: set PAGE_ID (or pass as arg1)'); process.exit(2); }
if (!SOURCE_DSN) { console.error('error: set SOURCE_DSN'); process.exit(2); }

const log = (...a) => console.error(...a);          // diagnostics → stderr (stdout is the SQL)
const out = (s) => process.stdout.write(s + '\n');

// Extra O2M children to follow: parent collection → { table, fk }. M2A junctions are auto-
// discovered; this is only for plain one-to-many content like a chart card's series.
const FOLLOW_O2M = {
  chart_cards: [{ table: 'chart_series', fk: 'chart_card' }],
  pages: [
    { table: 'journey_steps', fk: 'page' },
    { table: 'journey_links', fk: 'page' },
  ],
};

const client = new Client({
  connectionString: SOURCE_DSN,
  ssl: process.env.SOURCE_SSL ? { rejectUnauthorized: false } : undefined,
});

const collected = new Map();   // table -> Set(id)
const visited = new Set();     // "collection:id"
const add = (t, id) => { (collected.get(t) ?? collected.set(t, new Set()).get(t)).add(id); };

const existingTables = new Set();        // public tables present in the source DB (populated in buildJunctionMap)
const hasTable = (t) => existingTables.has(t);

async function buildJunctionMap() {
  const { rows } = await client.query(`SELECT many_collection, many_field, one_collection, one_allowed_collections FROM directus_relations`);
  for (const r of (await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)).rows) existingTables.add(r.table_name);
  // M2A junction = a table with a many_field='item' row (carries allowed collections).
  const junctions = [];
  for (const r of rows.filter((x) => x.many_field === 'item')) {
    if (!hasTable(r.many_collection)) { log(`warn: junction ${r.many_collection} in directus_relations but table missing; skipping`); continue; }
    const parent = rows.find((x) => x.many_collection === r.many_collection && x.many_field !== 'item');
    if (!parent) { log(`warn: junction ${r.many_collection} has no parent relation; skipping`); continue; }
    junctions.push({ table: r.many_collection, parentCol: parent.many_field, parentCollection: parent.one_collection });
  }
  const byParent = {};
  for (const j of junctions) (byParent[j.parentCollection] ??= []).push(j);
  return { junctions, byParent, junctionTables: new Set(junctions.map((j) => j.table)) };
}

async function tableColumns(table) {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND table_schema='public' ORDER BY ordinal_position`, [table]);
  return rows.map((r) => r.column_name);
}

async function walk(byParent) {
  const queue = [['pages', PAGE_ID]];
  while (queue.length) {
    const [coll, id] = queue.shift();
    const key = `${coll}:${id}`;
    if (visited.has(key)) continue;
    visited.add(key);
    add(coll, id);

    if (coll === 'pages') {
      // Select only columns that exist — an instance may lack hub_chart, dataset_metadata,
      // etc. if those fields/collections were never created. Absent columns read as undefined,
      // so the guards below naturally skip them.
      const pageCols = new Set(await tableColumns('pages'));
      const wanted = ['hub_chart', 'dataset_metadata', 'handbook', 'hero_image', 'parent'].filter((c) => pageCols.has(c));
      const p = wanted.length
        ? (await client.query(`SELECT ${wanted.map((c) => `"${c}"`).join(', ')} FROM pages WHERE id=$1`, [id])).rows[0] || {}
        : {};
      if (p.hub_chart) {
        if (hasTable('chart_cards')) queue.push(['chart_cards', p.hub_chart]);
        else log(`warn: page references hub_chart=${p.hub_chart} but chart_cards table is missing; skipping.`);
      }
      for (const [f, note] of [['dataset_metadata', 'dataset_metadata (+ its data_dictionary/files/charts)'], ['handbook', 'handbook'], ['hero_image', 'hero_image file (needs its S3 object too)']])
        if (p[f]) log(`note: page references ${note} = ${p[f]} — NOT copied; migrate separately if needed.`);
      if (p.parent) log(`note: parent = ${p.parent} — preserved as-is; ensure it exists in the target (FK).`);
    }

    for (const j of byParent[coll] ?? []) {
      const { rows } = await client.query(`SELECT id, item, collection FROM "${j.table}" WHERE "${j.parentCol}"=$1`, [id]);
      for (const r of rows) {
        add(j.table, r.id);
        if (r.item && r.collection) {
          if (hasTable(r.collection)) queue.push([r.collection, r.item]);
          else log(`warn: ${j.table} row ${r.id} references missing collection ${r.collection}; skipping.`);
        }
      }
    }
    for (const o of FOLLOW_O2M[coll] ?? []) {
      if (!hasTable(o.table)) { log(`warn: ${coll} O2M child table ${o.table} is missing; skipping.`); continue; }
      const { rows } = await client.query(`SELECT id FROM "${o.table}" WHERE "${o.fk}"=$1`, [id]);
      for (const r of rows) add(o.table, r.id);
    }
  }
}

async function emit(junctionTables) {
  out('-- Generated by migrate-page.mjs');
  out(`-- page: ${PAGE_ID}`);
  out('BEGIN;');
  out('SET LOCAL session_replication_role = replica;  -- bypass FK checks + pages triggers\n');

  // entities before junctions (cosmetic — replica role makes order irrelevant for FKs)
  const tables = [...collected.keys()].sort((a, b) => Number(junctionTables.has(a)) - Number(junctionTables.has(b)));
  for (const table of tables) {
    const ids = [...collected.get(table)];
    if (!ids.length) continue;
    if (!hasTable(table)) { out(`-- ${table} skipped (${ids.length}) — table missing in source`); continue; }
    // Serialize each row to jsonb and re-materialize it on import via
    // jsonb_populate_record(NULL::<table>, ...). The rowtype is resolved against the TARGET,
    // so columns the source has but the target lacks are dropped, and columns only the target
    // has default to NULL — the import tolerates column-level schema drift between instances.
    const q = `SELECT 'INSERT INTO "${table}" SELECT * FROM jsonb_populate_record(NULL::"${table}", ' || quote_literal(to_jsonb(t)::text) || '::jsonb) ON CONFLICT (id) DO NOTHING;' AS stmt FROM "${table}" t WHERE id = ANY($1::uuid[]) ORDER BY id`;
    const { rows } = await client.query(q, [ids]);
    out(`-- ${table} (${rows.length})`);
    for (const r of rows) out(r.stmt);
    out('');
  }
  out('SET LOCAL session_replication_role = origin;');
  out('COMMIT;');
}

(async () => {
  await client.connect();
  try {
    const { byParent, junctionTables } = await buildJunctionMap();
    await walk(byParent);
    log('\nCollected rows:');
    for (const [t, s] of [...collected.entries()].sort()) log(`  ${t}: ${s.size}`);
    await emit(junctionTables);
  } finally {
    await client.end();
  }
})().catch((e) => { log('FAILED:', e.message); process.exit(1); });
