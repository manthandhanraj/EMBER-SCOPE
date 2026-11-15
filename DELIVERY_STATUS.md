# Delivery status — 15 November 2026

## Challenge-objective revision — 15 November 2026

- **All PSI tables.** The importer now downloads every listed public experimental table by default. The live refresh imported 22 tables (2,009 source rows, up from 5 tables and 528 rows) from 20 of the 24 combustion entries, with no import issues. Accessions with two tables (PSI-10, PSI-159) are addressable as `PSI-10` and `PSI-10:2` in the app, the APIs and the verifier.
- **Harmonized PSI view.** A reviewed column mapping covers all 22 tables. It converts only single values, with explicit units, and flags ranges, lists, censored cells and display settings without coercing them. 607 rows are model-ready (oxygen, pressure and a reported outcome present): 274 FLEX and 333 CFI-G. The view is on `/psi#harmonized` and downloadable as CSV or JSON.
- **Flammability map** (`/flammability`). For SIBAL fabric and PMMA it shows oxygen vs airflow for every BASS-II test, the observed ignition bracket (SIBAL 16.8–16.9 % O₂, PMMA 14.1–16.4 %), the low-flow quench speeds (SIBAL 2.2–5 cm/s), blowoff, Saffire reference burns and the candidate habitat atmospheres. The boundary comes from observations. A logistic fit placed the SIBAL 50 % point at 15.4 %, below the observed failures, so it is not drawn.
- **Validation.** Grouped (session) cross-validation shows oxygen predicts ignition better than the baseline (AUC 0.80, 95 % interval 0.60–1.00; Brier 0.077 vs 0.094). Adding airflow does not help (Brier 0.080). Only 4 of 41 usable tests failed to ignite, so the intervals are wide.
- **Partial-gravity bounding chart.** For each material it plots the lowest oxygen with burning at microgravity, simulated lunar, Martian and Earth gravity, against the bounding band. SIBAL burned downward in simulated lunar gravity down to 18 % O₂, while NASA reports it goes out when burned downward in air at 1 g. Earth tests are therefore not a conservative bound for that case. For PMMA, the geometries differ (film, rod, slab), and the chart says so. Martian gravity is shown as a data gap.
- Navigation, the dashboard and `/readiness` link to the new page. `verify_delivery.py` now checks every table key, the harmonized totals and the flammability API.
- 144 JS/TS tests and 6 Python importer tests pass. The production build passes, and all 7 acceptance groups passed against a production server, including 2 live AI cases with qwen2.5:7b-instruct.

## Originality and license revision — 15 November 2026

- Checked the 2026 Space Apps Participant Terms (updated 7 August 2026). Non-NASA code and data may be reused when they are freely available or OSI open source, cited, and documented with their licenses. The MIT-licensed MicroFire Atlas foundation is therefore allowed. No rewrite was needed for eligibility.
- Added `REFERENCES.md`, which lists every cited resource and its license: the starting codebase, 24 PSI entries with DOI and license, 29 NASA documents, 4 NASA media items, AI models, AI development tools and the dependency licenses.
- Rewrote `docs/ORIGINAL-CONTRIBUTIONS.md` with a measured split of built vs reused code: about 26% new during the event, 46% upstream modified during the event and 29% upstream unchanged, by source size. The measurement method is stated in the file.
- Hosted copies are served at `/REFERENCES.txt` and `/ORIGINAL-CONTRIBUTIONS.txt` and linked from the footer and `/readiness`. A new test keeps them identical to the project files.
- Changed the default local chat model from `qwen2.5:3b-instruct`, which uses the non-OSI Qwen Research License, to `qwen2.5:7b-instruct`, which is Apache-2.0. The evaluation snapshots in `evaluation/` remain records of the 3B model.
- Removed pre-event code that the active app no longer used: the guided-tour module (`lib/judge.ts`), the video motion-analysis module (`lib/motion.ts` and its test) and ten legacy redirect pages. They were moved to the Windows Recycle Bin, not permanently deleted. The integrity assertions from the tour module (direct, analogous and abstain scenarios) were kept inside `lib/integrity.test.ts`.

## UI/UX readability and visual-report revision — 15 November 2026

- Completed the ten requested interface changes: larger readable text, near-white dark-mode text, unified styling, persistent light/dark modes, simpler navigation, real-data charts and tables, a grid-based evidence map without overlapping nodes, independently animated inner flame, ambient burning glow/embers, and clearer reports with expandable detail.
- Main workflow is Explore → Compare → Insights → Report. Advanced tools remain reachable through one menu. PSI catalog pagination reduces the initial page to six study cards while keeping the current twenty-four catalog entries and twenty-two imported tables available.
- Added chart aggregation checks. **146 JavaScript/TypeScript tests, type checking, targeted lint and the optimized Webpack production build passed.** Twelve production pages returned HTTP 200 in both themes with existing strict CSP intact; Markdown/JSON report attachments were verified.
- Browser verified theme switching/persistence, light/dark button contrast, desktop/mobile layouts, map pagination/all-fifteen list, PSI search/pagination and actual animation pause/resume. Final browser error logs were empty. Tested narrow pages had no horizontal page overflow. Wide tables keep intentional internal scrolling.
- Full requested-change checklist and preview images: `docs/UI-UX-CHECKLIST.md`. Scientific data, source text and original license notices were retained. Hosting remains deferred. No paid AI request was made for this UI revision.

## Requirement-gap revision

The latest verification is recorded in `evaluation/delivery-acceptance.json`; older sections below are dated implementation history. Owner/expert/deployment tasks are collected in the parent `MORNING-CHECKLIST.md`. A developer checklist is not a judge score or a claim of 100% scientific completeness.

- Actual public NASA PSI integration: 24 combustion repository entries, DOI/version/license/source hashes and file inventories; 5 original experimental CSV tables with 528 source rows. Public source snapshots and an offline rebuild were verified. No detector-performance labels, missing conditions or outcome classes were invented.
- 15 curated research profiles, 72 publication excerpts, 29 source manifests and 8 source-linked equipment/control/Earth-application cards. Combined discovery groups and specific follow-ups are not mutually exclusive campaigns. Original 78 curated solid-fuel outcome records remain separate from PSI source rows.
- Live local AI: installed qwen2.5:3b-instruct generation and downloaded all-minilm neural embeddings are connected. Real source-grounded generation and neural ranking were exercised without a paid API. The launcher can start an installed local engine; explicit generation, fallback and provider status are visible.
- Ranking now combines goal relevance, actual neural/lexical question similarity, closest joint record conditions, distinct habitat research priorities and evidence availability. Components, policy weights, similarity distances and separate matched-test tolerances are disclosed. Spacecraft, station and rover priorities differ beyond gravity.
- Active model workspace supports curated catalog/ignition/spread extraction, exclusions, source/label metadata, conservative grouping and CSV/JSON exports, plus original PSI source tables. The exploratory local logistic model retains applicability checks and grouped baseline diagnostics; no independently validated general fire predictor is claimed.
- Corrected source scope for SAME published smoke observations, original BASS versus BASS-II, original SAME versus SAME-R, SoFIE parent-program findings, FM² precursors/plans and E-FIELD terrestrial scope. Known repository/campaign discrepancies are flagged. Numeric parsing, other-gas percentages, material casing, statistic names, qualifiers and units gained regression checks.
- Added `/psi`, `/applications`, `/readiness`, `/api/psi`, `/api/applications`, `/api/ai-status`; restored `/model-lab` and added `/api/model-data`. Existing summaries, comparison, gap tools and research report remain available.
- Preserved original MIT copyright/permission, retained-source attribution and third-party model/data notices. New contribution disclosure: `docs/ORIGINAL-CONTRIBUTIONS.md`. Public and project notice copies match.

### Final verification

- **130 JavaScript/TypeScript tests passed** and **6 Python importer tests passed**. Targeted lint and launcher setup checks passed.
- Final optimized **Webpack production build and TypeScript checks passed**. The local Turbopack CSS-worker issue is avoided by `npm run build -- --webpack`; the package's normal build setting was not silently changed.
- Production acceptance script passed seven groups of checks: 17 pages/security headers; all 15 profile pages and short/detailed/JSON exports; exact downloaded PSI JSON cell fidelity and CSV shapes; three model-data targets and group separation; actual neural ranking for three distinct habitats; invalid-input/source-only scope checks; two live grounded AI smoke cases.
- Live AI responses are saved with the acceptance report. The final BASS case correctly flags two original-BASS-to-BASS-II attribution errors for review and excludes them from the accepted summary. Model generation can still be wrong: passing defined automatic checks does not prove semantic entailment or scientific accuracy. These two cases are developer smoke tests, not an independent quality benchmark.
- Browser checks passed for PSI search/combined filters/empty recovery, model extraction filters, unsupported/missing-input prediction withholding, applications/readiness pages, all 15 evidence-map nodes, SPICE selection, list mode and mobile navigation. Tested 430px pages had no horizontal page overflow; the evidence map uses intentional internal scrolling. Browser error log was empty. Preview: `docs/psi-upgrade-preview.jpg`.
- No public deployment, account submission, outreach message or paid-model call was performed. Public hosting remains deferred to the owner; local Ollama cannot serve a Vercel deployment. Independent expert review, missing detector/calibration data, event resource/rule checks and account-bound submission are listed in the morning checklist.

Reproduce local acceptance with `python runner.py --production --port 3002` in one terminal, then `python emberscope/pipelines/verify_delivery.py --live-ai` from the root. The second command explicitly invokes generation and can use a configured hosted provider; omit `--live-ai` for retrieval/export checks. Neural checks require the local all-minilm model. Verification servers are stopped after delivery checks.

## Selected active application

emberscope/ is the active project. The single parent runner.py starts the complete web dashboard and research/report/optional AI endpoints. The inactive prototype and duplicate ZIP copies were removed during workspace cleanup.

## Implemented

- Four chapters: investigation library, comparison/ranking, source-linked insights, mission research brief.
- Prevention, detection and suppression research goals; question, environment, material and numerical condition controls.
- Seven investigation groups with objectives, fuels, geometry, hardware, measurements, variables, official references and evidence limitations.
- Deterministic investigation ranking with disclosed weights and reasons, goal-first ordering and a top-study comparison table.
- Retained atlas/test comparison, evidence ladder, mission/gap analysis, research-planning exports, source manifests and methodology.
- Publication findings retain source/page links; project interpretations are labelled separately.
- SAME detection overview is explicitly not measured detector-performance evidence. Fuel phases and true/simulated gravity remain distinct.
- Optional AI synthesis receives source records, publication findings and labelled investigation overviews. Citation/number/unit/context checks remain; overview-only citations cannot verify measured outcomes. No provider configured returns evidence instead.
- Printable report, Markdown and JSON exports with findings/source metadata; investigation-overview JSON and existing research CSV downloads.
- Data-collection guide and three blank research metadata/finding/review templates.
- Neutral main navigation and research UI. Games, mascot/reward controls, classifier-lab UI and separate video upload/annotation service removed from the active workflow. Retired source/assets removed from the workspace; user runtime uploads preserved.
- MIT copyright/permission and data provenance retained. This version reuses licensed MicroFire Atlas components/curation and is not represented as wholly independent code.

## Verification

- 119 JavaScript/TypeScript tests passed, including six research-specific tests for ranking, missing results, condition validation, broad-query coverage and overview-only citation rejection.
- Type checking and final optimized production build passed.
- Production HTTP checks passed for home, four research views, atlas, compare, mission, gaps, sources, methods and data guide.
- Markdown/JSON attachments checked; source metadata, SAME overview status and lunar environment preserved. Investigation JSON contains all seven groups; invalid oxygen returns 400.
- Legacy workbench/game/model entry URLs redirect to research.
- Browser tested question submission, detection ranking, investigation table, report and actual Markdown download, mobile navigation and retained test table. No horizontal overflow in the tested mobile home viewport; browser error log was empty.
- Single launcher setup check and production startup passed. Verification server stopped after checks.

## Still requires your inputs

- Complete challenge Resources-tab list and official missing test tables/logs, sensor configuration, calibration histories and source-specific metadata.
- Numerical SAME detector results; broader PSI coverage and documented comparison protocols.
- Independent source/transcription review, expert assessment, held-out questions, reviewer agreement and scientific validation. No accuracy or time-saving percentage is claimed.
- A configured AI provider/account and live provider verification. No paid model call was made; default/provider availability is not guaranteed by software tests.
- Internet hosting, authentication and multi-user storage are outside this local delivery.

Software checks are not scientific validation or spacecraft fire-safety certification. Earlier video-workbench functionality is not part of the active app.

## Ignition Studio + evidence map revision

- Implemented the selected option 2 orange/charcoal chamber aesthetic and option 4 purple/cyan investigation map across the research workflow and navigation.
- Newly generated chamber artwork is an explicitly labelled concept illustration; original scientific data remains separate. Prompt/provenance: docs/IGNITION-DESIGN.md.
- Animated chamber drift, glow, scan overlay, embers and selected source connections; persistent pause/resume control and system reduced-motion support.
- Seven selectable investigations, goal highlighting, map/list alternatives, real source links and exact source/page-linked finding excerpts. SAME retains zero numerical rows/findings and its objectives-only status.
- Source/finding tabs support keyboard navigation. Research query, goal radios, environment/conditions, chapter navigation, ranking and brief exports are integrated with the new theme.
- 122 tests passed, including three new provenance/membership tests. Targeted lint and final optimized build passed; final build includes TypeScript checking.
- Browser verified selection, SAME empty state, publication references and excerpts, arrow-key tabs, pause/resume/persistence, mobile menu/list mode and narrow-screen overflow fixes. Research form submission, lunar detection ranking and actual Markdown download passed. Browser error log was empty.
- Final production HTTP checks passed for research views, retained atlas/comparison, artwork and report exports. The temporary production server was stopped; the user's existing development server on port 3000 was retained.
- No live paid research-answer provider call was made. New decorative motion is not a physical combustion simulation or validation result.

## Workspace cleanup — 14 November 2026

- Removed the inactive independent prototype, redundant ZIP packages, retired source/assets archive, unused Python dependency folders, retired game/guide/expedition/lab modules and their dedicated tests, the unused 3D scene, obsolete video-review templates, duplicate inner launcher and empty retired directories.
- Removed the redundant generated evidence snapshot only after verifying its five JSON files were byte-identical to source data; the exporter can regenerate it.
- Removed unused three/@types/three packages through the package manager and updated the lockfile.
- Bulk obsolete files were sent to Windows Recycle Bin for recovery, rather than permanently deleted. Required source code, scientific data, media, saved uploads, licensing and all research evaluation tools remain.
- Moved all five original challenge screenshots into docs/problem-statement/.
- Root now contains only emberscope/, runner.py, START-EMBERSCOPE.cmd and README.md.
- All 398 protected data/media/upload/license files matched their pre-cleanup fingerprint exactly.
- 96 active tests passed; 26 tests belonging solely to removed game/educational modules were retired. Type checking and launcher setup check passed.
- Optimized production build passed after cleanup. Home, ranking, report view and the source-linked export passed a production HTTP smoke check. The temporary verification server was stopped.
- Unused development/build caches were recycled; current production output and installed runtime dependencies remain.

## GitHub / Vercel deployment preparation

- Added Vercel's Next.js build configuration, pinned Node.js 24.x in package/lock metadata and added workspace Git ignore rules for generated output, uploads, credentials and local platform state.
- Enabled the non-secret .env.example template for source control and added DEPLOY-VERCEL.md with the correct nested app root and live verification steps.
- Metadata uses an explicit site origin or Vercel's production/deployment hostname, with localhost reserved for local fallback.
- Included public copies of the original license and third-party notices for hosted distribution.
- A separate alternative hosting draft was initialized but never published; it is not the selected Vercel production deployment and its local record is ignored by Git.
- Actual GitHub push, Vercel account import/publication and live-URL verification remain pending. Configuration readiness is not counted as completed hosting.
- Vercel settings/lockfile consistency and public license copies verified; final local optimized build and TypeScript checks passed. This does not substitute for a Vercel production deployment test.

## Investigation-summary completion — 15 November 2026

- Added `/investigations` with material/topic/name search, goal/phase filters, empty-state recovery and seven linked investigation briefs. Dashboard cards and evidence-map selections lead to the same summaries.
- Each brief has short/detailed views, eight source-linked design fields, labelled project interpretation, reported observations, authors' interpretations, background context, numerical condition spans with known/unknown denominators, all linked test records, missing inputs, references and method disclosure.
- Added full JSON and short/detailed Markdown attachments, copy, print/save-PDF controls and selected-investigation source retrieval. The evidence-only button does not call an AI provider; generated explanations remain separately requested and scoped to that investigation.
- Rechecked selected overview metadata against official NASA/NTRS sources. Sensor descriptions retain campaign-specific scope; historical plans and SoFIE parent-program findings are context, not newly measured results. Raw test rows and publication quotations were not fabricated or rewritten.
- Seven of seven curated briefs are available. The previous 75% estimate was not an audited score; neither availability nor automated checks establish complete NASA archive coverage, scientific accuracy or independent expert review.
- 104 active tests passed, including eight summary checks for source linkage, missing results, parent-program context, historical plans, numerical null/zero handling, export fidelity, missing-source detection and investigation-specific retrieval. Targeted lint passed.
- Browser checks passed for material search, combined filters, empty-state reset, detailed/short navigation, copy feedback, linked test records and source-only retrieval. The tested narrow-screen page had no horizontal overflow. Preview: docs/investigation-summary-preview.jpg.
- Final optimized build and TypeScript checks passed using `npm run build -- --webpack`. The local Turbopack run failed while starting its CSS worker; the supported Webpack build completed with normal filesystem access. Production HTTP checks passed for all seven brief pages, JSON/short/detailed Markdown attachments, the library/dashboard views and 400/404 responses. Selected-study evidence retrieval retained SAME's overview-only status and SoFIE's parent-program context. The temporary verification server was stopped.
- Live AI-provider verification, missing scientific measurements and independent expert/source review remain pending inputs. No hosting was performed; GitHub/Vercel publication is deferred until the user's edits are finished.
