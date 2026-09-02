#!/usr/bin/env python3
"""
Migrate a dataset page's `dataset_metadata` subtree from a source Directus to a
destination, preserving ids. Companion to migrate-page.py — that one handles the
page's block tree; this one handles the M2O `dataset_metadata` off the page and
everything hanging off it:

    pages.dataset_metadata
      -> dataset_metadata (scalars + contact_box M2O)
           -> chart_cards (dataset_metadata FK) -> chart_series (chart_card FK)
           -> contact_boxes (M2O)
           -> glossary_terms via dataset_metadata_glossary_terms  (created only if missing)
           -> directus_files via dataset_metadata_files            (binary re-uploaded)

All PKs are UUIDs, so the copy is id-preserving with no remapping. The `data_dictionary`
is deliberately NOT migrated here — run cms/seed/seed-disbursements-dictionary.sql on
the destination instead (it resolves the dataset by source_collection).

The one thing content can't carry is the file BINARY (it lives in the dest's storage):
each linked file is re-uploaded to the dest (deduped by filename), and the files
junction is pointed at the resulting id. Pass --skip-file to leave files alone.

Prereqs on the DESTINATION: the schema (new collections/fields) already migrated, and
the page's parent page present (only needed when this script has to CREATE the page).

Usage:
  SRC_URL=http://localhost:8056  SRC_TOKEN=<admin> \
  DEST_URL=https://<upgrade>     DEST_TOKEN=<admin> \
  python3 cms/seed/migrate-dataset.py <page-id>        # dry-run
  ... --apply                                          # write
  ... --apply --wipe                                   # clear the dataset-owned subtree first
"""
import json
import os
import sys
import urllib.request
import urllib.parse

SRC_URL = os.environ.get("SRC_URL", "http://localhost:8056").rstrip("/")
SRC_TOKEN = os.environ.get("SRC_TOKEN")
DEST_URL = (os.environ.get("DEST_URL") or "").rstrip("/")
DEST_TOKEN = os.environ.get("DEST_TOKEN")
APPLY = "--apply" in sys.argv
WIPE = "--wipe" in sys.argv
SKIP_FILE = "--skip-file" in sys.argv
ARGS = [a for a in sys.argv[1:] if not a.startswith("-")]
PAGE_ID = ARGS[0] if ARGS else os.environ.get("PAGE_ID")

AUDIT = {"user_created", "date_created", "user_updated", "date_updated"}


def api(base, token, path, method="GET", body=None):
    if not token:
        sys.exit("Missing token (set SRC_TOKEN / DEST_TOKEN).")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{base}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e).get("errors", [{}])[0].get("message", "")
        except Exception:
            msg = e.read().decode(errors="replace")[:200]
        sys.exit(f"Directus error {e.code} on {method} {path}:\n  {msg}")


def columns(collection):
    fs = api(SRC_URL, SRC_TOKEN, f"/fields/{collection}")["data"]
    return [f["field"] for f in fs if f.get("type") != "alias" and f["field"] not in AUDIT]


def src_items(collection, filt=None, ids=None):
    cols = columns(collection)
    q = {"fields": ",".join(cols), "limit": -1}
    if "sort" in cols:
        q["sort"] = "sort"
    if ids is not None:
        if not ids:
            return []
        filt = {"id": {"_in": list(ids)}}
    if filt:
        q["filter"] = json.dumps(filt)
    return api(SRC_URL, SRC_TOKEN, f"/items/{collection}?{urllib.parse.urlencode(q)}")["data"]


def strip(rows):
    return [{k: v for k, v in r.items() if k not in AUDIT} for r in rows]


def dest_existing_ids(collection, ids):
    if not ids:
        return set()
    q = urllib.parse.urlencode({"fields": "id", "limit": -1, "filter": json.dumps({"id": {"_in": list(ids)}})})
    return {r["id"] for r in api(DEST_URL, DEST_TOKEN, f"/items/{collection}?{q}")["data"]}


def post(collection, rows):
    for i in range(0, len(rows), 100):
        api(DEST_URL, DEST_TOKEN, f"/items/{collection}", method="POST", body=rows[i:i + 100])


def fetch_bytes(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as r:
        return r.read()


def dest_upload_file(meta):
    """Re-upload one file to the dest (deduped by filename_download); returns its dest id.
    The binary is streamed from the source's /assets; content is what matters, not the id."""
    name = meta.get("filename_download") or f"{meta['id']}"
    # Dedupe: reuse an existing dest file with the same download name.
    q = urllib.parse.urlencode({"fields": "id", "limit": 1, "filter": json.dumps({"filename_download": {"_eq": name}})})
    found = api(DEST_URL, DEST_TOKEN, f"/files?{q}")["data"]
    if found:
        return found[0]["id"]
    blob = fetch_bytes(f"{SRC_URL}/assets/{meta['id']}?download", SRC_TOKEN)
    boundary = "----onrrDatasetMigrate"
    ctype = meta.get("type") or "application/octet-stream"
    parts = []
    if meta.get("title"):
        parts += [f"--{boundary}", 'Content-Disposition: form-data; name="title"', "", meta["title"]]
    parts += [
        f"--{boundary}",
        f'Content-Disposition: form-data; name="file"; filename="{name}"',
        f"Content-Type: {ctype}", "",
    ]
    pre = ("\r\n".join(parts) + "\r\n").encode()
    body = pre + blob + (f"\r\n--{boundary}--\r\n").encode()
    req = urllib.request.Request(
        f"{DEST_URL}/files", data=body, method="POST",
        headers={"Authorization": f"Bearer {DEST_TOKEN}",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())["data"]["id"]
    except urllib.error.HTTPError as e:
        sys.exit(f"File upload failed ({e.code}): {e.read().decode(errors='replace')[:200]}")


def main():
    if not PAGE_ID:
        sys.exit("Pass the page id as an argument.")

    page = src_items("pages", ids=[PAGE_ID])
    if not page:
        sys.exit(f"Page {PAGE_ID} not found on source.")
    page = strip(page)[0]
    ds_id = page.get("dataset_metadata")
    if not ds_id:
        sys.exit(f"Page {PAGE_ID} has no dataset_metadata.")

    ds = strip(src_items("dataset_metadata", ids=[ds_id]))[0]

    contact = strip(src_items("contact_boxes", ids=[ds["contact_box"]])) if ds.get("contact_box") else []
    charts = strip(src_items("chart_cards", filt={"dataset_metadata": {"_eq": ds_id}}))
    series = strip(src_items("chart_series", filt={"chart_card": {"_in": [c["id"] for c in charts]}})) if charts else []
    term_junc = strip(src_items("dataset_metadata_glossary_terms", filt={"dataset_metadata_id": {"_eq": ds_id}}))
    glossary_ids = [r["glossary_terms_id"] for r in term_junc if r.get("glossary_terms_id")]
    glossary = strip(src_items("glossary_terms", ids=glossary_ids)) if glossary_ids else []
    file_junc = strip(src_items("dataset_metadata_files", filt={"dataset_metadata_id": {"_eq": ds_id}}))
    file_ids = [r["directus_files_id"] for r in file_junc if r.get("directus_files_id")]
    files_meta = [api(SRC_URL, SRC_TOKEN, f"/files/{fid}?fields=id,filename_download,type,title")["data"] for fid in file_ids]

    print(f"Page {PAGE_ID} -> dataset_metadata {ds_id}")
    for label, rows in [
        ("dataset_metadata", [ds]), ("contact_boxes", contact), ("chart_cards", charts),
        ("chart_series", series), ("glossary_terms (ref)", glossary),
        ("terms junction", term_junc), ("files junction", file_junc),
        ("files (binary re-upload)", [] if SKIP_FILE else files_meta),
    ]:
        print(f"  {len(rows):4}  {label}")
    print("  note: data_dictionary is NOT migrated — run seed-disbursements-dictionary.sql on dest.")

    if not (APPLY or WIPE):
        print("dry-run — set DEST_URL/DEST_TOKEN and re-run with --apply to write.")
        return
    if not (DEST_URL and DEST_TOKEN):
        sys.exit("Set DEST_URL and DEST_TOKEN to write.")

    # WIPE: clear the dataset-OWNED subtree (children/junctions first). Leaves the page,
    # shared glossary_terms, and files intact — so re-apply just re-links them.
    if WIPE:
        for coll, rows in [("chart_series", series), ("chart_cards", charts),
                           ("dataset_metadata_files", file_junc),
                           ("dataset_metadata_glossary_terms", term_junc),
                           ("dataset_metadata", [ds]), ("contact_boxes", contact)]:
            ids = [r["id"] for r in rows if r.get("id")]
            present = list(dest_existing_ids(coll, ids)) if ids else []
            if present:
                api(DEST_URL, DEST_TOKEN, f"/items/{coll}", method="DELETE", body=present)
                print(f"  wiped {len(present):4}  {coll}")

    if not APPLY:
        print("wiped only (no --apply).")
        return

    # 1. glossary_terms — create only the ones the dest doesn't already have (shared content).
    have = dest_existing_ids("glossary_terms", glossary_ids)
    new_glossary = [g for g in glossary if g["id"] not in have]
    if new_glossary:
        post("glossary_terms", new_glossary)
    print(f"  glossary_terms: {len(new_glossary)} created, {len(have)} already present")

    # 2. contact_boxes (dataset_metadata.contact_box FKs to it).
    if contact:
        post("contact_boxes", contact)
        print(f"  wrote {len(contact):4}  contact_boxes")

    # 3. files: re-upload the binary to the dest, remap the junction's file id.
    file_id_map = {}
    if not SKIP_FILE:
        for meta in files_meta:
            file_id_map[meta["id"]] = dest_upload_file(meta)
        if files_meta:
            print(f"  uploaded {len(files_meta):4}  files (binary)")

    # 4. dataset_metadata (FK -> contact_box), then charts/series (FK -> dataset_metadata/chart_card).
    post("dataset_metadata", [ds]); print("  wrote    1  dataset_metadata")
    if charts:
        post("chart_cards", charts); print(f"  wrote {len(charts):4}  chart_cards")
    if series:
        post("chart_series", series); print(f"  wrote {len(series):4}  chart_series")

    # 5. junctions.
    if term_junc:
        post("dataset_metadata_glossary_terms", term_junc)
        print(f"  wrote {len(term_junc):4}  dataset_metadata_glossary_terms")
    if file_junc and not SKIP_FILE:
        remapped = [{**r, "directus_files_id": file_id_map.get(r["directus_files_id"], r["directus_files_id"])} for r in file_junc]
        post("dataset_metadata_files", remapped)
        print(f"  wrote {len(remapped):4}  dataset_metadata_files")

    # 6. page: link it. Patch the FK if the page already exists on dest, else create it.
    if dest_existing_ids("pages", [PAGE_ID]):
        api(DEST_URL, DEST_TOKEN, f"/items/pages/{PAGE_ID}", method="PATCH", body={"dataset_metadata": ds_id})
        print("  patched  pages.dataset_metadata (page already on dest)")
    else:
        post("pages", [page])
        print("  wrote    1  pages (created — ensure its parent page exists on dest)")

    print("done.  Now run seed-disbursements-dictionary.sql on the dest for the data dictionary.")


if __name__ == "__main__":
    main()
