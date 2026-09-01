# `cms/seed/` — migration & seed tooling

Scripts for seeding, backfilling, migrating, and backing up the ONRR Directus data.
Most take a Directus admin/static token via `DIRECTUS_TOKEN` (or `SRC_TOKEN` /
`DEST_TOKEN`) — no secrets are stored here.

> **⚠ Keep this manifest current.** Whenever a file is **added to** or **removed from**
> `cms/seed/`, update the table below **in the same commit**. The manifest is tracked; the
> transient data exports are not (see _Gitignore convention_).

## Files

| File | What it does |
| --- | --- |
| `README.md` | This manifest. |
| `seed.sh` | Generic batch-create seeder: POST a JSON array file to a collection. `DIRECTUS_TOKEN=… bash seed.sh <collection> <file>`. |
| `seed-events.sh` | Seed upcoming events from `events-upcoming.json`. |
| `export-handbook-toc.py` | Fold the five legacy per-handbook TOC collections into one `handbook_toc` seed, resolving each row to its `handbooks` parent by title (survives id changes). |
| `backfill-contact-topics.py` | Backfill the `contacts` ↔ `contact_topics` M2M junction from the legacy `contacts.page` string. Dry-run by default; `--apply` to write. |
| `backfill-role-type.py` | Backfill `contacts_person.role_type` (federal/supervisor/indian/backup/manager) and normalize the free-string `role` values. Dry-run / `--apply`. |
| `backfill-section.py` | Backfill `contacts.section` from the dropped `tab`/`accordion` (`coalesce(accordion, tab)`). Dry-run / `--apply`. |
| `fix-contacts-section.py` | One-off: fix the `Onshore& Offshore` typo and label the Royalty half of the `oil-gas-reporting` topic. Dry-run / `--apply`. |
| `migrate-page.py` | Move one CMS page + its full block tree between Directus instances, id-preserving. Discovers M2A block junctions from `/relations` at runtime, so it works for any page/block type. `--wipe` clears the tree first (safe re-runs); `--apply` writes. |
| `convert-pk-to-uuid.sql` | Convert the group-1 content collections from serial (integer) PKs to UUID PKs, preserving data + field config. **Rehearse on local first, then upgrade** (procedure in the file header). |
| `drop-orphan-collections.sql` | Remove the obsolete registered collections `pages_back` (a 2021 pages backup) and `parent_url` — table + Directus metadata. Run on both instances after confirming the backup is disposable; re-snapshot `current.yaml` after (they're registered collections). |
| `order-contacts-by-role.sql` | Set `contacts_person.sort` so each contact's people order by role: Primary Contact Federal → Supervisor Federal → Primary Contact Indian → Supervisor Indian, then plain Supervisor / Manager / Backup / other. Data-only (no re-snapshot). Apply on local then upgrade. |
| `drop-handbook-collections.sql` | Remove the five legacy per-handbook TOC collections (`revenue_handbook`, `production_handbook`, `solid_minerals_handbook`, `geothermal_class_1`, `geothermal_class_2_3`) now folded into `handbook_toc` — plus their five orphaned `collection_blocks`. Verify `handbook_toc` first; re-snapshot after. |
| `backup-local-db.sh` | Timestamped `pg_dump` of the local Directus Postgres (Docker) → `~/Developer/ONRR/db-backups`. Verifies the dump completed cleanly. |

## Gitignore convention

Tracked: the tooling (`*.sh`, `*.py`, `*.sql`, this `README.md`).
Ignored: transient content exports — `/cms/seed/*.json` and `/cms/seed/contacts-migration/`.
These are point-in-time data snapshots, regenerated on demand by the scripts above; keep them
out of git. To pin a specific JSON as a canonical seed, `git add -f <file>` and note it here.
