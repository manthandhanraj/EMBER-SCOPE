# What we built vs what we reused

EmberScope was not written from scratch. It started from **MicroFire Atlas** by AKM Asifuzzaman, which is MIT-licensed; its original notice is kept unchanged in [LICENSE](../LICENSE). During the NASA Space Apps Challenge, 14–15 November 2026, the team rebuilt it into a research dashboard for the "Flame in Freefall" challenge. This page states which part is which. Please keep it with presentations and source copies.

All citations and licenses are listed in [REFERENCES.md](../REFERENCES.md).

## Code split by size

These numbers cover source code only: TypeScript, TSX, CSS and Python under `apps/web/app`, `components`, `lib`, `pipelines` and `templates`. Data files, media and dependencies are not counted.

| Category | Code files | Size | Share |
|---|---|---|---|
| **New during the event** (14–15 Nov 2026) | 63 | 314 KB | ~31% |
| **Upstream, modified during the event** | 47 | 436 KB | ~43% |
| **Upstream, unchanged** (last modified before 14 Nov 2026) | 53 | 273 KB | ~27% |

### How the split was measured

- The project folder has no git history, so the split is based on two things:
  - **File modification dates.** Files last changed before the event start (14 Nov 2026, 00:00 IST) count as unchanged upstream.
  - **The delivery logs** in [DELIVERY_STATUS.md](../DELIVERY_STATUS.md), which name the modules added during the event.
- A file counts as "modified" if it existed upstream and was changed on 14 or 15 November. That covers anything from a one-line fix to a heavy rewrite, so this row overstates how much upstream code is left as written.
- The CSS rows include the upstream global stylesheet (`app/globals.css`, about 46 KB). That stylesheet alone is about a tenth of the "modified" size.
- Measured again on 15 November after the flammability map and the full PSI import were added.
- On 15 November, pre-event code that the active app no longer used was removed. This covered the old guided-tour module, the video motion-analysis module and ten legacy redirect pages.

## Built during the event

These features answer the "Flame in Freefall" objectives directly. None of them existed in the upstream project.

| Feature | Main files |
|---|---|
| **Real NASA PSI integration.** Importer for the public PSI repository, 24-entry combustion catalog with DOI, version, license and hash audit, all 22 listed experimental tables (2,009 source rows) kept as raw cells, PSI browser and exports | `pipelines/import_psi.py`, `pipelines/test_import_psi.py`, `data/psi-catalog.json`, `data/psi-numerical.json`, `lib/psi-data.ts`, `lib/psi-evidence.ts`, `app/psi/`, `app/api/psi/` |
| **Four-chapter research dashboard and evidence map.** Library, compare & rank, fire-safety insights and mission brief | `components/research/*`, `app/research/`, `app/research-theme.css` |
| **Multi-factor investigation ranking.** Combines goal, neural or lexical question similarity, closest joint test conditions, habitat research priorities and evidence availability, with every weight disclosed | `lib/research.ts`, `lib/habitat-context.ts` |
| **Local AI.** Neural sentence embeddings for ranking and grounded local generation through Ollama, with status and fallback | `lib/local-ai.ts`, `app/api/ai-status/`, local-provider path in `app/api/ask/route.ts` |
| **15 investigation profiles** (upstream had none at this level). Source-linked short and detailed briefs, search, filters and Markdown/JSON exports. Covers BASS/BASS-II, Saffire, SAME, SAME-R, FLEX, FLEX-2, ACME, SoFIE-GEL, LUCI, SPICE, SLICE, CFI, CFI-G, E-FIELD and FM² | `data/investigations.json`, `lib/investigation-summary.ts`, `app/investigations/`, `app/api/investigations/` |
| **Research applications.** 8 source-linked cards on next-generation fire controls and equipment and on Earth applications, including fine water mist, smoke detection and firefighter protection | `data/research-applications.json`, `app/applications/`, `app/api/applications/` |
| **Model-data workspace.** Catalog, ignition and spread-rate extraction, exclusions, grouped splits, CSV/JSON export and raw PSI extraction | `lib/model-workspace.ts`, `components/model-workspace/*`, `app/api/model-data/`, the rewritten `app/model-lab/page.tsx` |
| **Expanded scientific sources.** 10 new findings and 10 new source manifests | `data/expanded-findings.json`, `data/expanded-sources.json` |
| **Harmonized PSI view.** Reviewed column mapping of all 22 tables onto shared oxygen, pressure, airflow, diluent and outcome fields with explicit unit conversions; ranges, lists and censored cells flagged, not coerced; 607 model-ready rows | `lib/psi-harmonized.ts`, `app/psi/` (harmonized section), `app/api/psi/` |
| **Flammability map.** Oxygen vs airflow per material with observed ignition, low-flow quench and blowoff boundaries, Saffire references, candidate habitat atmospheres and grouped cross-validation of oxygen and airflow as ignition predictors | `lib/flammability.ts`, `components/flammability/*`, `app/flammability/`, `app/api/flammability/` |
| **Partial-gravity bounding chart.** Lowest oxygen with burning at microgravity, simulated lunar, Martian and Earth gravity per material, testing whether microgravity and 1 g results bound intermediate gravity | `lib/flammability.ts` (`gravityBounds`), `components/flammability/GravityBounds.tsx` |
| **Requirement readiness page** that maps every challenge requirement to its evidence | `app/readiness/` |
| **Research report exports and data-collection guide** | `app/api/research/report/`, `app/data-guide/`, `templates/*` |
| **Acceptance verification and launcher** | `pipelines/verify_delivery.py`, `runner.py` (project root) |
| **Ignition Studio visual design.** AI-generated concept artwork, motion and theme | `components/research/FireChamber.*`, `public/design/ignition-chamber.png` |

## Reused from MicroFire Atlas

| Reused part | Status in EmberScope |
|---|---|
| Curated test records (BASS-II 56, Saffire 20, LUCI 2), 62 publication findings, 19 source manifests | Kept as upstream curation, credited to its authors. Not re-transcribed by the team. |
| Evidence ladder, ontology and condition matching (`lib/ontology.ts`, `lib/relevance.ts`, `lib/finding-relevance.ts`) | Kept. The ontology was extended for the new investigations. |
| AI-answer checker: citation, number, unit and gravity-context checks (`lib/ask-core.ts`) | Kept and extended with campaign-name, statistic and qualifier checks. |
| Exploratory logistic model and applicability gate (`lib/model-lab.ts`) | Kept. The new model-data workspace is built on top of it. |
| Atlas, compare, mission, gaps, challenge, Saffire, experiment and methodology pages, and their components | Kept and restyled. Navigation now leads into the research dashboard. |
| Historical evaluation sets (`apps/web/eval/`) | Kept as historical provenance. They do not measure the current app. |

## What this does not claim

- EmberScope is not presented as an independent rewrite.
- The pretrained models (Qwen2.5-7B-Instruct, all-MiniLM-L6-v2) were not trained by the team.
- The logistic model is exploratory. It is not a validated spacecraft fire predictor.
- NASA has not endorsed the project.
- Under the 2026 Space Apps Terms, reused open-source code is allowed when it is cited and its license is documented. This page and [REFERENCES.md](../REFERENCES.md) provide that.
