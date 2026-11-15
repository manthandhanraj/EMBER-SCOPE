# EmberScope — Flame in Freefall

A local NASA combustion research dashboard for discovery, comparison and source-linked fire-safety interpretation. This is the selected active app. It retains MIT-licensed MicroFire Atlas tools and curated data; see LICENSE and THIRD_PARTY_NOTICES.md.

**Built vs reused:** about 31% of the source code is new from the hackathon, 43% is upstream code changed during the event and 27% is unchanged upstream code. The challenge-specific features are new: PSI ingestion and harmonization, the flammability map, the partial-gravity bounding chart, the research dashboard, multi-factor ranking, local AI, investigation profiles, applications and the model-data workspace. See docs/ORIGINAL-CONTRIBUTIONS.md. Every cited source and license (NASA data, AI models, AI tools, dependencies) is in REFERENCES.md.

## Start

Use the single runner.py in the parent NASA project folder:

```powershell
python runner.py
```

Or double-click the parent START-EMBERSCOPE.cmd. Open http://127.0.0.1:3000. Ctrl+C stops the app. From this folder use `python ../runner.py`. `--check` verifies setup; `--port 3002` selects another port; `--production` uses an existing optimized build.

Requires Python 3.10+ and Node.js 24+. First installation, from apps/web: `npm ci`. No separate Python backend, OpenCV installation or video service is needed. The launcher runs the web app and its research/report/optional AI endpoints.

## Four chapters

1. Research library: searchable investigation briefs with objectives, materials, geometry, hardware, measurements, variables, gravity, conditions, findings, limitations and sources.
2. Compare & rank: prevention/detection/suppression goal, question, material and environment; disclosed relevance weights, applicability limits and side-by-side study comparison.
3. Fire-safety insights: publication findings with source/page links, labelled project interpretations, corpus gaps and optional AI synthesis with citation/number/context checks.
4. Mission research report: printable brief, Markdown export, JSON with findings/source metadata and retained CSV downloads.

The library has 15 curated profiles, including BASS/BASS-II, Saffire, SAME, FLEX, ACME, SoFIE-GEL, LUCI, SPICE, SLICE, CFI, CFI-G, E-FIELD, FLEX-2, SAME-R and FM². Combined groups and follow-ups are discovery profiles, not mutually exclusive campaign counts. There are 78 curated solid-fuel outcome records (56 BASS-II, 20 Saffire, 2 simulated lunar LUCI), 72 publication excerpts and 29 source manifests. SAME includes published smoke-property observations; detector-performance validation remains separate.

Actual NASA PSI ingestion adds a separate 24-entry combustion metadata snapshot and all 22 listed experimental CSV tables with 2,009 source rows. A harmonized view maps every table onto shared oxygen, pressure, airflow and outcome fields; 607 rows are model-ready (oxygen, pressure and a reported outcome). Open `/psi`; reproduce using `python emberscope/pipelines/import_psi.py` from the project root. Do not sum raw PSI and curated rows as unique tests. Details: docs/PSI-INTEGRATION.md.

### Investigation briefs

Open `/investigations`, or use **Read full investigation brief** in an evidence-map selection. Search by name, material or topic; filter by research goal and fuel phase. Every curated group has a short summary and a detailed, source-linked brief, with Markdown/JSON download, copy and print/save-PDF controls. Deterministic briefs work without an AI key. `/api/investigations/{id}` exports the full summary packet; `?format=markdown&mode=concise` exports a short Markdown brief.

Detailed briefs separate reported observations, authors' interpretations and background/planning context. Available numerical spans show units and known/unknown row counts; the linked records preserve individual conditions and source pages. SoFIE parent-program findings are labelled context, and historical launch plans do not become measured outcomes. References, missing inputs and review status travel with exports. The optional source-retrieval button stays within the selected investigation and never calls an AI provider; generated explanations require a separate explicit request.

**15/15 briefs available** describes software/content availability for these profiles. It does not mean all NASA investigations, measured data or independent scientific validation are complete. The earlier 75% estimate was not a measured completeness or accuracy score.

The atlas, individual-test comparisons, mission/gap tools, sources and methodology remain. Games, mascot/reward UI, classifier lab and separate video upload/annotation workflow have been removed from the active experience. Their old entry URLs and the unused pre-event tour and video-motion modules were removed on 15 November. Obsolete prototypes, ZIP copies and retired source archives have been removed from this workspace. Challenge screenshots are retained in docs/problem-statement/; existing local runtime uploads were preserved.

## Visual design

Ignition Studio orange/charcoal research console with an animated conceptual chamber and interactive purple/cyan evidence constellation. Select any of seven investigations, highlight a research goal, switch map/list view, and inspect exact publication excerpts or original sources. The header motion control persists your choice; system reduced-motion preferences are respected. See docs/IGNITION-DESIGN.md for artwork provenance and the generation prompt.

## AI and model tools

The installed Ollama engine provides local qwen2.5:7b-instruct generation (Apache-2.0) and all-minilm sentence embeddings (Apache-2.0) without paid keys. Do not use qwen2.5:3b-instruct: its Qwen Research License is not OSI open source, which the Space Apps Terms require for third-party materials. The launcher starts an installed engine if needed; it does not download models. Real local generation and neural ranking were exercised during delivery. Only an explicit explanation request invokes language-model generation. AI status: `/readiness` and `/api/ai-status`.

Investigation ranking uses goal, neural question similarity (or disclosed lexical fallback), joint per-record conditions, habitat research priorities and evidence availability. Spacecraft, station and rover priorities differ beyond gravity. Weights, components and separate similarity/coverage tolerances are disclosed in pages and exports.

For online generation, configure a supported hosted provider in the server environment using .env.example. Local loopback models are unavailable to Vercel, so hosted deployment retains the disclosed lexical/condition ranking unless a separate server-side embedding deployment is supplied. No paid model call was made; hosted provider/account compatibility still needs a live check.

`/flammability` draws the oxygen-airflow flammability map per material with observed ignition, quench and blowoff boundaries, grouped cross-validation, candidate habitat atmospheres, and a partial-gravity chart that tests whether microgravity and Earth results bound lunar and Martian gravity. `/model-lab` prepares catalog, ignition-establishment and reported spread-rate datasets, exclusions and grouped partitions. The narrow local logistic model has conservative domain checks and descriptive grouped baseline diagnostics. Raw PSI cells retain their original schema and require target/unit/protocol review before training. `/applications` covers source-linked equipment/control research and Earth applications.

Automatic checks flag some citation, number, unit, prediction and gravity-context errors; they do not prove scientific correctness. Investigation objectives cannot verify measured outcomes. Scores are project heuristics, not confidence, NASA ratings, fire probabilities or crew procedures.

## Checks and data

From apps/web:

```powershell
npm test
npm run typecheck
npm run build
```

pipelines/build_dataset.py validates/exports manually curated records; it does not reproduce original PDF transcription. pipelines/fetch_sources.py optionally retrieves official PDFs and compares hashes. Neither runs automatically.

Read DATA-YOU-NEED.md or /data-guide for source collection and independent review. Missing tables, calibration histories, full PSI coverage, expert validation and live provider evaluation remain real inputs. Historical evaluation snapshots retain provenance and do not measure this revised app. NASA does not endorse or certify the application.

## Online deployment

Use GitHub → Vercel; see DEPLOY-VERCEL.md. The expected Root Directory for the complete workspace repository is emberscope/apps/web. The app pins Node 24.x and includes its Vercel build configuration. These are deployment settings, not evidence of a live published site.
