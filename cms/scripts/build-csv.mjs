#!/usr/bin/env node
/**
 * build-csv.mjs — read a migrate-page.mjs .sql dump and emit two CSVs plus a printed
 * tree, so a page's block hierarchy (the pages → page_blocks → tab/expansion nesting)
 * is legible without importing the SQL anywhere.
 *
 *   <prefix>-structure.csv  the block tree in render order: depth + indent_label show
 *                           nesting; parent_collection/parent_id give the edges.
 *   <prefix>-items.csv      a flat index of every content row by collection + label/id.
 *
 * It parses the jsonb_populate_record(NULL::"<table>", '<json>') statements (handling
 * both the plain '...' and escaped E'...' literal forms) — no DB connection needed.
 *
 * Usage:
 *   node scripts/build-csv.mjs page.sql [outDir]
 *   # outDir defaults to the .sql file's directory; <prefix> is its basename
 *   # (e.g. valuation-page.sql → valuation-page-structure.csv, valuation-page-items.csv)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/build-csv.mjs page.sql [outDir]'); process.exit(2); }
const outDir = process.argv[3] || dirname(file);
const prefix = basename(file).replace(/\.sql$/i, '');
const sql = readFileSync(file, 'utf8');

// Decode a Postgres string literal body back to its original text. quote_literal
// doubles every ' -> '' and every \ -> \\ (prefixing E when backslashes are present),
// so reverse exactly those two doublings; nothing else is escaped.
function decodeLiteral(s, isE) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "'" && s[i + 1] === "'") { out += "'"; i++; continue; }
    if (isE && s[i] === '\\' && s[i + 1] === '\\') { out += '\\'; i++; continue; }
    out += s[i];
  }
  return out;
}

// --- parse: one INSERT per line -------------------------------------------------
const byTable = new Map();
const index = new Map(); // "coll:id" -> row
// Literal body opens with either '  or  E'  right after the table name.
const openRe = /jsonb_populate_record\(NULL::"([^"]+)", (E?)'/;
for (const line of sql.split('\n')) {
  if (!line.startsWith('INSERT INTO')) continue;
  const m = line.match(openRe);
  const end = line.lastIndexOf("'::jsonb)");
  if (!m || end < 0) continue;
  const table = m[1];
  const bodyStart = m.index + m[0].length;      // first char after the opening quote
  const lit = decodeLiteral(line.slice(bodyStart, end), m[2] === 'E');
  let row;
  try { row = JSON.parse(lit); } catch (e) { console.error(`parse fail ${table}: ${e.message}`); continue; }
  (byTable.get(table) ?? byTable.set(table, []).get(table)).push(row);
  index.set(`${table}:${row.id}`, row);
}

const JUNCTIONS = new Set(['pages_page_blocks', 'tab_blocks_tab_blocks', 'expansion_panels_expansion_panel_blocks']);
const PAGE_ID = (byTable.get('pages')?.[0] || {}).id;

// --- label resolution -----------------------------------------------------------
function labelOf(coll, row) {
  if (!row) return '(missing row)';
  switch (coll) {
    case 'pages': return row.title;
    case 'tab_blocks': { // tab_block_label is an M2O to tab_block_label collection
      const lbl = index.get(`tab_block_label:${row.tab_block_label}`);
      return lbl ? lbl.tab_block_label : (row.tab_block_label ? `[label ${row.tab_block_label}]` : '(tab)');
    }
    case 'expansion_panels': return row.block_label;
    case 'content_blocks': return row.block_label;
    case 'collection_blocks': return row.header || row.description || (row.collection ? `[collection: ${row.collection}]` : '(collection block)');
    case 'tab_block_label': return row.tab_block_label;
    case 'expansion_panel_block_label': return row.block_label;
    default: return row.title || row.header || row.block_label || row.label || row.name || row.description || '';
  }
}

// --- edges from the three junctions ---------------------------------------------
const edges = new Map(); // parentKey -> [{coll,id,sort,via}]
const addEdge = (pk, e) => (edges.get(pk) ?? edges.set(pk, []).get(pk)).push(e);
for (const j of byTable.get('pages_page_blocks') || [])
  addEdge(`pages:${j.pages_id}`, { coll: j.collection, id: j.item, sort: +j.sort || 0, via: 'page_blocks' });
for (const j of byTable.get('tab_blocks_tab_blocks') || [])
  addEdge(`tab_blocks:${j.tab_blocks_id}`, { coll: j.collection, id: j.item, sort: +j.Sort || 0, via: 'tab_blocks' });
for (const j of byTable.get('expansion_panels_expansion_panel_blocks') || [])
  addEdge(`expansion_panels:${j.expansion_panels_id}`, { coll: j.collection, id: j.item, sort: +j.sort || 0, via: 'exp_panel' });

// --- DFS the tree ---------------------------------------------------------------
const treeRows = [];
const seen = new Set();
let order = 0;
function walk(coll, id, depth, parentColl, parentId, via, sort) {
  const key = `${coll}:${id}`;
  const row = index.get(key);
  treeRows.push({ order: order++, depth, coll, id, label: labelOf(coll, row), sort, via, parentColl, parentId, present: row ? 'y' : 'MISSING' });
  if (seen.has(key)) { treeRows[treeRows.length - 1].note = '(repeat — children shown earlier)'; return; }
  seen.add(key);
  const kids = (edges.get(key) || []).slice().sort((a, b) => a.sort - b.sort);
  for (const k of kids) walk(k.coll, k.id, depth + 1, coll, id, k.via, k.sort);
}
walk('pages', PAGE_ID, 0, '', '', 'root', 0);

// --- CSV helpers ----------------------------------------------------------------
const esc = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v).replace(/[\r\n]+/g, ' ').trim();
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (headers, rows) => [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n') + '\n';

// structure CSV
const structCsv = toCsv(
  ['order', 'depth', 'indent_label', 'label', 'collection', 'id', 'sort', 'via', 'parent_collection', 'parent_id', 'present', 'note'],
  treeRows.map((r) => ({
    order: r.order, depth: r.depth,
    indent_label: `${'— '.repeat(r.depth)}${r.label || ''}`,
    label: r.label, collection: r.coll, id: r.id, sort: r.sort, via: r.via,
    parent_collection: r.parentColl, parent_id: r.parentId, present: r.present, note: r.note,
  })),
);
const structPath = join(outDir, `${prefix}-structure.csv`);
writeFileSync(structPath, structCsv);

// flat items CSV (every non-junction content row)
const itemRows = [];
for (const [t, rows] of byTable) {
  if (JUNCTIONS.has(t)) continue;
  for (const r of rows) itemRows.push({
    collection: t, id: r.id, label: labelOf(t, r), sort: r.sort ?? '',
    status: r.status ?? '', collection_ref: r.collection ?? '', date_updated: r.date_updated ?? '',
  });
}
itemRows.sort((a, b) => a.collection.localeCompare(b.collection) || String(a.label).localeCompare(String(b.label)));
const itemsPath = join(outDir, `${prefix}-items.csv`);
writeFileSync(itemsPath, toCsv(['collection', 'id', 'label', 'sort', 'status', 'collection_ref', 'date_updated'], itemRows));

// --- printed tree for quick read ------------------------------------------------
console.log(`\nPAGE: ${labelOf('pages', index.get(`pages:${PAGE_ID}`))}  (${PAGE_ID})\n`);
for (const r of treeRows.slice(1)) {
  const pad = '  '.repeat(r.depth);
  console.log(`${pad}• [${r.coll}] ${r.label || ''}${r.note ? ' ' + r.note : ''}${r.present === 'MISSING' ? '  <<MISSING>>' : ''}`);
}
console.log(`\ncounts:`);
for (const [t, rows] of [...byTable].sort()) console.log(`  ${t}: ${rows.length}`);
console.log(`\nwrote:\n  ${structPath} (${treeRows.length} rows)\n  ${itemsPath} (${itemRows.length} rows)`);
