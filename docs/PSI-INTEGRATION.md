# NASA PSI integration — 15 November 2026

EmberScope now imports the **actual public NASA Physical Sciences Informatics repository**, independently of the existing NTRS-derived curated outcome corpus. A live import (refreshed 15 November 2026) succeeded for all **24 combustion investigation records** returned by the repository search on this date. The snapshot contains their DOI, version, license, objectives, approach, hardware, platform, publication metadata and **16,379 listed files**. Listed file counts are repository inventory counts, not test counts; videos and large archives were not downloaded.

All **22 experimental CSV tables** listed by those entries were downloaded through NASA's public download service (2,009 source rows; 20 of the 24 entries list at least one table, and PSI-10 and PSI-159 list two each). Each is kept with its original column names and cell strings. Examples of what the rows represent:

| PSI accession | Investigation | Source rows | What these rows represent |
| --- | --- | ---: | --- |
| PSI-25 | BASS-II | 129 | Experimental log, materials, test identifiers, calibrated initial/final oxygen and gas measurements. Air-display strings are fan settings, not velocities. |
| PSI-69 | FLEX | 274 | Droplet runs with fuel, pressure (mmHg), O₂/N₂/CO₂/He mole fractions and the reported test end (extinction, disruption or completion). |
| PSI-159 | CFI-G (2 tables) | 333 | Normal and inverse gas flames with O₂ fraction, pressure (bar) and whether hot ignition occurred. |
| PSI-10 | ACME Flame Design (2 tables) | 327 | Normal and inverse flame conditions (O₂ fraction, flow rates, pressure); no outcome column. |
| PSI-107 | SPICE | 469 | Coflow air speed and fuel rates; the smoke-point result is not in this table. |
| PSI-101 / PSI-102 | SAME-R / SAME | 117 | Smoke-generation and aging settings. Not an alarm-sensitivity or false-alarm dataset. |
| PSI-98 / 99 / 100 | Saffire-I / II / III | 21 | Sample, airflow, oxygen and burn time for the large-scale burns. |

The source table rows remain distinct from the curated, source/page-linked outcome records. They are not automatically deduplicated, merged, interpreted as detector performance or used as ground-truth labels. Some tables include parameter ranges, session summaries, missing cells, censored values or changing conditions.

## Harmonized model-ready view

`apps/web/lib/psi-harmonized.ts` holds a reviewed column mapping for every table. It maps each row onto shared fields: fuel, fuel phase, platform, oxygen (%), pressure (kPa), airflow (cm/s), diluents and any outcome the table reports.

- Only a single number is converted. Ranges ("1.5 - 5"), lists ("21; 26.5; 40"), censored values ("<1"), fan display settings and spreadsheet artifacts ("3400%") stay null and keep their original text with a flag.
- Conversions are explicit: mole fraction × 100 → %, atm × 101.325, bar × 100, mmHg × 0.133322 → kPa.
- Source quirks are recorded rather than fixed silently. For example, FLEX headers read "O", "N" and "CO" for O₂, N₂ and CO₂, and ACME s-Flame reads "N3"–"N9" where N₂ is meant.
- No outcome is inferred. A row is **model-ready** when oxygen, pressure and a reported outcome are all present. That gives 607 rows: 274 FLEX droplet runs and 333 CFI-G gas flames.

Download it from `/psi#harmonized`, or use `/api/psi?format=harmonized-csv&ready=1` (model-ready rows) or `/api/psi?format=harmonized` (JSON with source text). Model-ready does not mean validated: define the target, group repeat sessions and keep post-test measurements out of the predictors before training.

## Reproduce the import

From the project root, with Python 3.10+ and internet access:

```powershell
python emberscope/pipelines/import_psi.py
```

This command needs no API key or third-party Python packages. It makes a public repository search, downloads bounded JSON metadata responses with four concurrent workers, and requests every listed public experimental CSV table (each under 2 MiB). It refuses incomplete search pagination and private/restricted metadata. Table failures are recorded as issues rather than fabricated rows. Existing application datasets are not overwritten by this pipeline.

The outputs are:

- `apps/web/data/psi-catalog.json`: application-ready metadata/file inventory, DOI, version, license, retrieval time and SHA-256 of every original JSON response.
- `apps/web/data/psi-numerical.json`: separately labelled experimental-table packets, original column names (trimmed), cell strings or null for empty cells, per-table source/version/hash and stable download-service URL.
- `runtime/psi/`: original JSON responses, fetched-at sidecars and original experimental CSV bytes for local audit/offline rebuild. Runtime is ignored by Git; the normalized application snapshots are tracked project data.

Rebuild from the already downloaded original responses without network access:

```powershell
python emberscope/pipelines/import_psi.py --offline
```

Limit a refresh to selected investigations, or omit table downloads:

```powershell
python emberscope/pipelines/import_psi.py --ids PSI-25 PSI-102 --tables PSI-25
python emberscope/pipelines/import_psi.py --tables
```

The output is the selected subset when `--ids` is used; use the default full import to restore the whole combustion catalog. A normal live import replaces the normalized PSI snapshots with the newly fetched version. `builtAt` denotes snapshot assembly; each record's `provenance.retrievedAt` denotes the source response's original retrieval time, including during an offline rebuild.

Run the importer checks:

```powershell
python -m unittest discover -s emberscope/pipelines -p test_import_psi.py -v
```

## Verified NASA service URLs

These URLs were obtained from the public PSI portal's deployed application and then exercised successfully; they are not guessed aliases for the biological OSDR API:

- Repository search: `https://psi.nasa.gov/geode-py/ws/repo/search?source=psi&type=investigation&size=100&ffield=Research+Area&fvalue=Combustion+Science`
- Investigation JSON: `https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25`
- Human-readable investigation: `https://psi.nasa.gov/physci/repo/data/investigations/PSI-25`
- A listed experimental CSV is requested from `/geode-py/ws/studies/{accession}/download` using the exact file name and study version returned in metadata. NASA returns a short-lived signed URL for its own `psi-repo-prod.s3.amazonaws.com/psi-data/` bucket. That URL is validated and used in memory, never retained in application data or logs. Stable service URLs and hashes are retained instead.

This is the **public portal service used by NASA's website**, not a separately documented long-term compatibility guarantee. If NASA changes it, the importer fails visibly; the app's timestamped snapshot remains usable. The integration does not imply the biological OSDR endpoints contain PSI combustion records.

## Source and numerical limits

Metadata is labelled as objectives/approach, not measured conclusions. Source wording is retained rather than silently reconciled: for example, PSI-39's objective and approach currently list different pressure ranges. Such differences require original report/data review.

Experimental CSV import does not infer units, fill gaps or coerce source values such as `none`, `<1`, changing-flow strings or negative CO readings to convenient numbers. An empty CSV cell becomes null; explicit source strings remain strings. The original CSV hash provides a byte-level audit even though JSON column names/cell edges are trimmed for display. No full sensor history, uncertainty estimate, operational material certification or expert validation is implied.

## What the user may still need to do

1. Open the selected investigation's official PSI landing page and inspect its Files/experimental-table documentation. Record the DOI and exact investigation/file versions.
2. For a future restricted file, use NASA's normal account and data-request flow yourself. This importer deliberately does not handle accounts, access tokens or data-use agreements.
3. Obtain any missing calibration, timing, detector-performance or outcome definitions from the original linked material or investigator contact. A table of smoke-generation settings is not a detector validation benchmark.
4. Have an independent reviewer check table semantics, censoring, source discrepancies, repeated tests and unit conversions before promoting source cells into a harmonized training/evaluation dataset. Record review decisions and exclusions.
5. If a refresh fails because of network restrictions, rerun the import with normal internet access. If the public NASA service changes, preserve the existing snapshots and update the importer against the current portal's verified service; do not replace it with invented data.

NASA source pages: [PSI repository](https://psi.nasa.gov/physci/repo/), [BASS-II DOI](https://doi.org/10.60555/4qc4-de67), [NASA PSI search guide](https://science.nasa.gov/wp-content/uploads/2024/11/psi-database-guide.pdf). The source license for each investigation is included in its snapshot; preserve that license and DOI in downstream work.
