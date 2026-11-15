"""Import public NASA PSI combustion metadata and small experimental CSV tables.

Uses the public JSON service used by NASA's PSI repository, discovered from the
portal's deployed application configuration. It is not a promise of a stable API.
No API key, account, video download, inferred outcome or unit conversion is used.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import re
from urllib.error import HTTPError
from urllib.parse import urlencode, urljoin, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[1]
PSI = "https://psi.nasa.gov"
SEARCH_URL = PSI + "/geode-py/ws/repo/search?" + urlencode({
    "source": "psi", "type": "investigation", "size": 100,
    "ffield": "Research Area", "fvalue": "Combustion Science",
})
MAX_JSON_BYTES = 12 * 1024 * 1024
MAX_TABLE_BYTES = 2 * 1024 * 1024
ACCESSION = re.compile(r"PSI-[1-9][0-9]{0,5}\Z")


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def validate_url(url, *, download=False):
    parsed = urlparse(url)
    allowed = {"psi.nasa.gov"}
    if download:
        allowed.add("psi-repo-prod.s3.amazonaws.com")
    if parsed.scheme != "https" or parsed.hostname not in allowed or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError("Only verified public NASA PSI HTTPS services are allowed")
    if parsed.hostname == "psi-repo-prod.s3.amazonaws.com" and not parsed.path.startswith("/psi-data/"):
        raise ValueError("Unexpected PSI download bucket path")
    return url


def fetch(url, max_bytes=MAX_JSON_BYTES, *, download=False):
    # Redirects are validated before being followed; temporary signed URLs are
    # never printed, written to manifests, or accepted as CLI arguments.
    opener = build_opener(NoRedirect)
    for _ in range(4):
        validate_url(url, download=download)
        try:
            with opener.open(Request(url, headers={"User-Agent": "EmberScope-PSI-public-import/1", "Accept": "application/json,text/csv,text/plain"}), timeout=45) as response:
                payload = response.read(max_bytes + 1)
                if len(payload) > max_bytes:
                    raise ValueError("Response exceeds the bounded import size")
                return payload
        except HTTPError as error:
            if error.code in (301, 302, 303, 307, 308):
                url = urljoin(url, error.headers.get("Location", ""))
                continue
            raise ValueError(f"PSI returned HTTP {error.code}") from None
    raise ValueError("Too many download redirects")


def accession(value):
    if not isinstance(value, str) or not ACCESSION.fullmatch(value):
        raise ValueError("Invalid PSI accession")
    return value


def metadata_url(value):
    return PSI + "/geode-py/ws/repo/investigations/" + accession(value)


def clean(value):
    # Keep source wording, including source inconsistencies; strip HTML markup.
    if not isinstance(value, str):
        return ""
    return re.sub(r"<[^>]+>", " ", value).strip()


def normalize_metadata(data, raw, retrieved_at):
    if not isinstance(data, dict):
        raise ValueError("PSI metadata must be an object")
    key = accession(data.get("accession"))
    if not data.get("title") or not isinstance(data.get("version"), (int, float)):
        raise ValueError("PSI record requires a title and version")
    if data.get("public") is not True or data.get("restricted") is True:
        raise ValueError("Only public, unrestricted metadata is imported")
    candidates = [*data.get("added", []), *data.get("modified", []), *data.get("experimentalTable", [])]
    files = {}
    table_names = {f.get("file_name") for f in data.get("experimentalTable", [])}
    removed = {f.get("file_name") for f in data.get("removed", [])}
    for item in candidates:
        name = item.get("file_name")
        if not isinstance(name, str) or not name or name in removed or item.get("visible") is False:
            continue
        path = item.get("remote_path", "")
        category = path.split("/")[4] if len(path.split("/")) > 4 else "Unspecified"
        try:
            size = max(0, int(item.get("file_size") or 0))
        except (TypeError, ValueError):
            size = 0
        files[name] = {
            "name": name, "sizeBytes": size, "category": category,
            "subcategory": clean(item.get("subcategory")),
            "restricted": item.get("restricted") is True,
            "experimentalTable": name in table_names,
            "fileVersion": item.get("version"),
            # Stable portal landing URL avoids persisting expiring credentials.
            "sourceUrl": PSI + "/physci/repo/data/investigations/" + key,
        }
    return {
        "accession": key, "title": clean(data["title"]),
        "acronym": clean(data.get("investigationAcronym")),
        "doi": clean(data.get("doi")), "version": data["version"],
        "license": clean(data.get("licenseIdentifier")),
        "licenseName": clean(data.get("licenseName")),
        "objectives": clean(data.get("objective")), "approach": clean(data.get("approach")),
        "hypothesis": clean(data.get("hypothesis")), "researchImpacts": clean(data.get("researchImpacts")),
        "hardware": clean(data.get("experimentHardware")),
        "project": {"type": clean(data.get("projectType")), "platform": clean(data.get("flightProgram")),
                    "start": clean(data.get("investigationStartDate")), "end": clean(data.get("investigationEndDate")),
                    "researchArea": clean(data.get("researchArea")), "subResearchArea": clean(data.get("subResearchArea"))},
        "releaseDate": clean(data.get("releaseDate")), "modifiedDate": clean(data.get("modifiedDate")),
        "publications": [{"title": clean(p.get("title")), "doi": clean(p.get("doi"))} for p in data.get("publications", [])],
        "files": sorted(files.values(), key=lambda f: (not f["experimentalTable"], f["name"])),
        "listedFileCount": len(files),
        "metadataOnly": True,
        "provenance": {"metadataUrl": metadata_url(key), "landingUrl": PSI + "/physci/repo/data/investigations/" + key,
                       "sha256": hashlib.sha256(raw).hexdigest(), "retrievedAt": retrieved_at},
    }


def parse_csv(raw):
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("cp1252")
    text = text.replace("\r\r\n", "\n")
    reader = csv.reader(io.StringIO(text, newline=""))
    source_headers = next(reader, [])
    headers = [h.strip() for h in source_headers]
    if not headers or any(not h for h in headers) or len(set(headers)) != len(headers):
        raise ValueError("CSV must have distinct non-empty column names")
    rows = []
    for line_number, values in enumerate(reader, start=2):
        if not values or all(not value.strip() for value in values):
            continue
        if len(values) != len(headers):
            raise ValueError(f"CSV row {line_number} has an unexpected column count")
        rows.append({key: value.strip() or None for key, value in zip(headers, values)})
    return headers, rows


def import_table(record, file, cache, *, offline=False):
    if file["restricted"] or not file["experimentalTable"] or not file["name"].lower().endswith(".csv"):
        raise ValueError("Only public experimental CSV tables are imported")
    if file["sizeBytes"] > MAX_TABLE_BYTES:
        raise ValueError("Experimental table is larger than the bounded limit")
    # Cache names are generated from trusted accession and a hash, never filenames.
    cache_file = cache / (record["accession"] + "-" + hashlib.sha256(file["name"].encode()).hexdigest()[:12] + ".csv")
    query = urlencode({"file": file["name"], "studyVersion": record["version"], "redirect": "false"})
    stable_url = PSI + "/geode-py/ws/studies/" + record["accession"] + "/download?" + query
    if offline:
        raw = cache_file.read_bytes()
    else:
        result = fetch(stable_url, max_bytes=16384)
        signed_url = result.decode("utf-8").strip()
        validate_url(signed_url, download=True)
        raw = fetch(signed_url, max_bytes=MAX_TABLE_BYTES, download=True)
        cache_file.write_bytes(raw)
    headers, rows = parse_csv(raw)
    return {"accession": record["accession"], "title": record["title"], "fileName": file["name"],
            "investigationVersion": record["version"], "fileVersion": file["fileVersion"],
            "doi": record["doi"], "license": record["license"], "columns": headers,
            "rows": rows, "rowCount": len(rows), "valueEncoding": "original strings or null; no numeric/unit coercion",
            "scope": "Experimental log/table, not a harmonized prediction dataset. Outcomes and units require source-specific review.",
            "provenance": {"metadataUrl": record["provenance"]["metadataUrl"], "landingUrl": record["provenance"]["landingUrl"],
                           "downloadServiceUrl": stable_url, "sha256": hashlib.sha256(raw).hexdigest(),
                           "retrievedAt": record["provenance"]["retrievedAt"]}}


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true", help="Rebuild from previously fetched response snapshots")
    parser.add_argument("--ids", nargs="*", help="Subset of PSI accession IDs; default discovers combustion catalog")
    parser.add_argument("--tables", nargs="*", default=None, help="Import public experimental CSV tables only for these IDs (default: every listed table; an empty flag disables tables)")
    parser.add_argument("--cache", type=Path, default=ROOT / "runtime/psi")
    args = parser.parse_args(argv)
    cache = args.cache.resolve()
    cache.mkdir(parents=True, exist_ok=True)
    search_file = cache / "combustion-search.json"
    if args.ids:
        ids = sorted(set(accession(value) for value in args.ids))
        search_hash = None
        search_total = len(ids)
    else:
        if not args.offline:
            search_file.write_bytes(fetch(SEARCH_URL))
        raw_search = search_file.read_bytes()
        search_data = json.loads(raw_search)
        search_hits = search_data["hits"]["hits"]
        ids = sorted({accession(hit["_source"]["Accession"]) for hit in search_hits})
        total = search_data["hits"]["total"]
        search_total = total.get("value") if isinstance(total, dict) else total
        if search_total != len(ids):
            raise ValueError("Search pagination changed or exceeds the bounded 100-record page; import aborted")
        search_hash = hashlib.sha256(raw_search).hexdigest()
    stamp = now()

    def load(key):
        snapshot = cache / (key + ".json")
        stamp_file = cache / (key + ".fetched-at.txt")
        if not args.offline:
            raw = fetch(metadata_url(key))
            snapshot.write_bytes(raw)
            stamp_file.write_text(stamp, encoding="ascii")
        raw = snapshot.read_bytes()
        retrieved = stamp_file.read_text(encoding="ascii").strip()
        return normalize_metadata(json.loads(raw), raw, retrieved)

    with ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(load, ids))
    tables, failures = [], []
    for record in records:
        if args.tables is not None and record["accession"] not in args.tables:
            continue
        for file in record["files"]:
            if not file["experimentalTable"] or not file["name"].lower().endswith(".csv"):
                continue
            try:
                tables.append(import_table(record, file, cache, offline=args.offline))
            except Exception as error:
                # No signed URL or exception internals are retained in public output.
                failures.append({"accession": record["accession"], "fileName": file["name"],
                                 "reason": str(error) if isinstance(error, ValueError) else type(error).__name__})
    catalog = {"schemaVersion": "emberscope-psi-catalog-1", "builtAt": stamp,
               "source": "NASA Physical Sciences Informatics (PSI)", "sourceUrl": SEARCH_URL,
               "searchSha256": search_hash, "repositoryResultCount": search_total,
               "scope": "Public combustion investigation metadata and file inventory. Metadata counts are not measured test counts; selected experimental CSV tables are separately preserved as raw strings.",
               "investigations": records, "experimentalTablesImported": len(tables), "tableImportIssues": failures}
    numerical = {"schemaVersion": "emberscope-psi-experimental-tables-1", "builtAt": stamp,
                 "scope": "Original PSI experimental table cell strings, including missing and censored values. Not harmonized with the curated outcome corpus; no synthetic outcomes, conversions or accuracy claim.",
                 "tables": tables, "issues": failures}
    write_json(ROOT / "apps/web/data/psi-catalog.json", catalog)
    write_json(ROOT / "apps/web/data/psi-numerical.json", numerical)
    print(f"Imported {len(records)} PSI investigation metadata records and {len(tables)} experimental CSV tables ({sum(t['rowCount'] for t in tables)} source rows).")
    print(f"Experimental table issues: {len(failures)}. Raw snapshots: {cache}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
