# EmberScope — references, licenses and reuse disclosure

This file lists every outside resource used to build EmberScope, with its license. Use it for the "References" part of the NASA Space Apps project submission form.

The 2026 NASA Space Apps Participant Terms and Conditions (updated 7 August 2026, https://www.spaceappschallenge.org/legal/) allow non-NASA code and data ("Solution Materials") when they are freely available or licensed as open source under the OSI definition. The Terms also require that "all resources, even open source resources, must be cited" and that license documentation is included with the solution. This file is that documentation.

Which parts of the code were built during the hackathon and which were reused is in [docs/ORIGINAL-CONTRIBUTIONS.md](docs/ORIGINAL-CONTRIBUTIONS.md).

---

## 1. Starting codebase

| Resource | Author | License | How EmberScope uses it |
|---|---|---|---|
| MicroFire Atlas | AKM Asifuzzaman, © 2026 | MIT (OSI-approved). The original notice is kept unchanged in [LICENSE](LICENSE) and served at `/LICENSE.txt`. | EmberScope started from this codebase. Reused parts: the curated BASS-II, Saffire and LUCI test records (`data/experiments.json`, `saffire.json`, `luci.json`), the original 62 publication findings (`data/findings.json`) and 19 source manifests (`data/sources.json`), the evidence ladder and ontology, the AI-answer checker, the exploratory logistic model, the atlas, compare, mission, gaps and challenge tools, and the historical evaluation sets in `apps/web/eval/`. |

> **Owner action:** add the public repository or page URL of MicroFire Atlas here, if one exists. The Space Apps Terms ask that third-party solution materials be publicly available.

---

## 2. NASA data

### 2.1 NASA Physical Sciences Informatics (PSI)

- Source: https://psi.nasa.gov
- Retrieved: 14–15 November 2026, by `pipelines/import_psi.py` from the public PSI repository search for Research Area "Combustion Science". All 22 experimental tables listed by the 24 entries were imported (2,009 source rows).
- The catalog keeps a SHA-256 hash of the search result.
- The license, DOI and version of each entry are copied from its PSI metadata.

| Accession | Investigation | DOI | Version | License | Experimental table imported |
|---|---|---|---|---|---|
| PSI-10 | Advanced Combustion via Microgravity Experiments / Flame Design | https://doi.org/10.60555/w4zy-bt45 | 1 | not stated in PSI metadata | yes (2 tables) |
| PSI-100 | Spacecraft Fire Experiment-III | https://doi.org/10.60555/040q-4h36 | 4 | CC0-1.0 | yes |
| PSI-101 | Smoke Aerosol Measurement Experiment-Reflight | https://doi.org/10.60555/2np7-jv14 | 4 | CC0-1.0 | yes |
| PSI-102 | Smoke and Aerosol Measurement Experiment | https://doi.org/10.60555/gd4k-8h62 | 4 | CC0-1.0 | yes |
| PSI-106 | Structure and Liftoff In Combustion Experiment | https://doi.org/10.60555/pm12-rg61 | 3 | CC0-1.0 | yes |
| PSI-107 | Smoke Point In Co-flow Experiment | https://doi.org/10.60555/9kbh-e962 | 4 | CC0-1.0 | yes |
| PSI-115 | Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity | https://doi.org/10.60555/q0v5-1v28 | 3 | CC0-1.0 | no table listed (metadata only) |
| PSI-117 | Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis | https://doi.org/10.60555/gz0q-b577 | 2 | CC0-1.0 | no table listed (metadata only) |
| PSI-142 | Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames | https://doi.org/10.60555/80qf-vj95 | 2 | CC0-1.0 | yes |
| PSI-159 | Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases | https://doi.org/10.60555/cyt1-kh64 | 1 | CC0-1.0 | yes (2 tables) |
| PSI-20 | Advanced Combustion via Microgravity Experiments - Burning Rate Emulator | https://doi.org/10.60555/vb93-3y72 | 4 | CC0-1.0 | yes |
| PSI-21 | Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame | https://doi.org/10.60555/23e1-9950 | 4 | CC0-1.0 | yes |
| PSI-22 | Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames | https://doi.org/10.60555/se5a-8c73 | 7 | CC0-1.0 | yes |
| PSI-23 | Advanced Combustion via Microgravity Experiments - Structure and Response of Spherical Diffusion Flames | https://doi.org/10.60555/k57n-p030 | 4 | CC0-1.0 | yes |
| PSI-25 | Burning and Suppression of Solids - II | https://doi.org/10.60555/4qc4-de67 | 4 | CC0-1.0 | yes |
| PSI-26 | Burning and Suppression of Solids | https://doi.org/10.60555/58h4-dy80 | 4 | CC0-1.0 | yes |
| PSI-39 | Cool Flames Investigation | https://doi.org/10.60555/m6pj-a914 | 4 | CC0-1.0 | yes |
| PSI-47 | Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 | https://doi.org/10.60555/ztgj-d202 | 5 | CC0-1.0 | yes |
| PSI-60 | Computational and Experimental Analysis of SPICE Data Sets | https://doi.org/10.60555/mzjm-yv57 | 1 | CC0-1.0 | no table listed (metadata only) |
| PSI-62 | Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography | https://doi.org/10.60555/e9xp-ex83 | 1 | CC0-1.0 | no table listed (metadata only) |
| PSI-68 | Flame Extinguishment Experiment - 2 | https://doi.org/10.60555/byp8-h018 | 6 | CC0-1.0 | yes |
| PSI-69 | Flame Extinguishment Experiment | https://doi.org/10.60555/mbq8-0451 | 5 | CC0-1.0 | yes |
| PSI-98 | Spacecraft Fire Safety Experiment-I | https://doi.org/10.60555/0t15-1z43 | 4 | CC0-1.0 | yes |
| PSI-99 | Spacecraft Fire Experiment-II | https://doi.org/10.60555/2chp-m469 | 5 | CC0-1.0 | yes |

### 2.2 NASA publications and investigation overviews

All 29 documents are listed in `apps/web/data/sources.json` and `expanded-sources.json`. Those files also record each document's PDF hash, retrieval date and what it was used for. Publication findings in the app quote short excerpts with page numbers and link back to these originals.

| # | Document | Type | Year | Rights recorded by the source | Link |
|---|---|---|---|---|---|
| 1 | Burning and Suppression of Solids–II (BASS-II) Summary Report | Technical memorandum | 2021 | GOV_PERMITTED | https://ntrs.nasa.gov/citations/20210011385 |
| 2 | Combustion of Solids in Microgravity: Results from the BASS-II Experiment | Presentation | 2014 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20160000593 |
| 3 | Microgravity Flammability of PMMA Rods in Concurrent Flow | Conference paper | 2015 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20150008961 |
| 4 | Concurrent Flame Growth, Spread and Extinction over Composite Fabric Samples in Low Speed Purely Forced Flow in Microgravity | Conference paper | 2015 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20150008962 |
| 5 | Thickness and Fuel Preheating Effects on Material Flammability in Microgravity from the BASS Experiment | Presentation | 2013 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20140011099 |
| 6 | Effects of Confinement on Flame Spread in Microgravity | Conference paper | — | GOV_PERMITTED | https://ntrs.nasa.gov/citations/20205004657 |
| 7 | Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test | Conference paper | 2012 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20130010991 |
| 8 | Lunar Combustion Investigation: Flammability Results from a Rotating Sounding Rocket | Presentation | — | GOV_PERMITTED | https://ntrs.nasa.gov/citations/20250010653 |
| 9 | Results of a 3-day Pilot Study to Validate Planetary Prebreathe Protocols Using a 56.5 kPa 34% O2, 66% N2 Saturation Cabin Atmosphere | Presentation | — | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20220009546 |
| 10 | NASA Exploration Atmosphere Tests 3 & 4: Development and Validation of Planetary Extravehicular Activity Prebreathe Protocols for Alternate Atmospheres and Suit Pressures | Abstract | — | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20240013238 |
| 11 | Flammability of Materials on the Moon | Poster | — | GOV_PERMITTED | https://ntrs.nasa.gov/citations/20240008623 |
| 12 | Flammability of Materials on the Moon | Poster | — | GOV_PERMITTED | https://ntrs.nasa.gov/citations/20240015307 |
| 13 | NASA Exploration Atmosphere Test 6: Back to Back EVAs | Presentation | — | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20260003261 |
| 14 | Results of Large-Scale Spacecraft Flammability Tests | Presentation | 2017 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20170008805 |
| 15 | Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires | Presentation | — | MAY_INCLUDE_COPYRIGHT_MATERIAL | https://ntrs.nasa.gov/citations/20210017780 |
| 16 | Preliminary Results from the Saffire VI Experiment | Conference paper | — | MAY_INCLUDE_COPYRIGHT_MATERIAL | https://ntrs.nasa.gov/citations/20240002981 |
| 17 | Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011 | Technical publication | 2015 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20150023456 |
| 18 | Solid Fuel Ignition and Extinction (SoFIE) Project on ISS | Presentation | 2019 | PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20200000361 |
| 19 | Advanced Combustion via Microgravity Experiments (ACME) on the International Space Station (ISS) | Poster | — | GOV_PUBLIC_USE_PERMITTED | https://ntrs.nasa.gov/citations/20210015913 |
| 20 | Smoke Aerosol Measurement Experiment (SAME) and SAME-R | NASA investigation overview | — | see original NASA source | https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf |
| 21 | Structure & Liftoff in Combustion Experiment (SLICE) | NASA investigation overview | — | see original NASA source | https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf |
| 22 | Smoke Point in Co-flow Experiment (SPICE) | NASA investigation overview | — | see original NASA source | https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf |
| 23 | Cool Flame Investigation: Science Concept Review — Objectives and Requirements Definition | Science concept review | 2014 | see original NASA source | https://www1.grc.nasa.gov/wp-content/uploads/CFI_SCR_May_2014_Dietrich_v1.pdf |
| 24 | Laminar Non-Premixed Flames of Gaseous Fuel (ACME presentation) | Presentation | — | see original NASA source | https://ntrs.nasa.gov/citations/20220007191 |
| 25 | Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames) | NASA investigation overview | — | see original NASA source | https://science.nasa.gov/biological-physical/investigations/e-field-flames/ |
| 26 | Flame Extinguishment Experiment (FLEX), FLEX-2 and FLEX-2J | NASA investigation overview | — | see original NASA source | https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf |
| 27 | NASA PSI-101: Smoke Aerosol Measurement Experiment-Reflight (SAME-R) | PSI investigation metadata | — | see original NASA source | https://psi.nasa.gov/physci/repo/data/investigations/PSI-101 |
| 28 | Flammability of Materials on the Moon (FM²) | NASA investigation overview | — | see original NASA source | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/ |
| 29 | Fine-Water-Mist Multiple-Orientation-Discharge Fire Extinguisher | NASA tech brief | 2010 | see original NASA source | https://ntrs.nasa.gov/citations/20100001376 |

Items 15 and 16 are marked by NTRS as possibly containing copyrighted material. EmberScope quotes only short, page-cited excerpts from them and links to the originals. It does not redistribute those PDFs.

Other NASA pages used for investigation overviews:
- https://science.nasa.gov/mission/acme/
- https://science.nasa.gov/biological-physical/investigations/sofie-gel/
- https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/

### 2.3 NASA media

These files are served from `apps/web/public/media/`. NASA media is not copyrighted in the United States under the NASA media usage guidelines. Credit: NASA. No NASA endorsement is implied.

| Media | NASA ID | Link |
|---|---|---|
| Saffire-V Experiment January 2021 (video) | GRC-2021-CN-00008 | https://images.nasa.gov/details/GRC-2021-CN-00008 |
| Saffire-VI inside Northrop Grumman's Cygnus spacecraft (video) | Saf-VI S8C3+C4 1-sided PMMA | https://images.nasa.gov/details/Saf-VI%20S8C3%2BC4%201-sided%20PMMA_unmapped_jpeg-20x%20no%20text |
| BASS Experiment imagery | iss035e015900 | https://images.nasa.gov/details/iss035e015900 |
| BASS-II Experiment | iss040e086481 | https://images.nasa.gov/details/iss040e086481 |

The challenge itself: NASA Space Apps Challenge 2026, "Flame in Freefall". Screenshots of the challenge page are kept in `docs/problem-statement/`.

---

## 3. AI models used by the running app

| Model or service | Role in EmberScope | License or terms | Included in this repository? |
|---|---|---|---|
| Qwen2.5-7B-Instruct (`qwen2.5:7b-instruct`, Qwen team, Alibaba Cloud) | Local generation of source-linked explanations | Apache-2.0 | No. Installed separately with `ollama pull qwen2.5:7b-instruct`. |
| all-MiniLM-L6-v2 (`all-minilm`, sentence-transformers) | Neural question-to-investigation similarity used in ranking | Apache-2.0 | No. Installed with `ollama pull all-minilm`. |
| Ollama | Local model runtime | MIT | No. Installed separately. |
| OpenAI API or Anthropic API (optional) | Hosted generation, only when a key is configured | Provider terms of service. These are services, not distributed materials. | No. Server-side keys only. |

Until 15 November 2026 the default local model was `qwen2.5:3b-instruct`. That model is released under the non-OSI "Qwen Research License", so the default was changed to the Apache-2.0 7B model. `evaluation/delivery-acceptance.json` was regenerated with the 7B model; `evaluation/local-ai-live-same.json` is an earlier record made with the 3B model.

---

## 4. AI tools used while building the project

The team used these assistants to write code, documentation and data-curation scripts:

- **Claude / Claude Code** (Anthropic)
- **OpenAI ChatGPT / Codex**

The decorative chamber artwork (`apps/web/public/design/ignition-chamber.png`) was generated on 14 November 2026 with the image-generation tool built into the AI assistant. The full prompt is in [docs/IGNITION-DESIGN.md](docs/IGNITION-DESIGN.md). It is a concept illustration, not NASA imagery.

> **Owner action:** confirm which tool generated the artwork and name it here.

The team reviewed all AI-assisted output. Scientific values come from the NASA sources above; they were not generated by a model.

---

## 5. Software dependencies

Direct dependencies of `apps/web` (versions from `package-lock.json`):

| Package | Version | License |
|---|---|---|
| next | 16.3.8 | MIT |
| react, react-dom | 19.2.8 | MIT |
| @anthropic-ai/sdk | 0.131.0 | MIT |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| eslint | 9.39.5 | MIT |
| eslint-config-next | 16.3.8 | MIT |
| @types/node, @types/react, @types/react-dom | 20.19 / 19.3 / 19.3 | MIT |

The installed dependency tree has 345 packages, all under OSI-approved or public-domain licenses:

| License | Packages |
|---|---|
| MIT | 295 |
| Apache-2.0 | 19 |
| ISC | 13 |
| BSD-2-Clause | 7 |
| MPL-2.0 | 3 |
| BSD-3-Clause | 2 |
| CC0-1.0, Unlicense, 0BSD, Python-2.0 | 1 each |
| CC-BY-4.0 | 1 (caniuse-lite browser-support data; attribution: caniuse.com) |
| Apache-2.0 AND LGPL-3.0-or-later | 1 (prebuilt libvips binary used by Next.js image optimization) |

The Python pipelines (`pipelines/*.py`) use only the Python standard library.

---

## 6. License of this project

- The upstream MIT license and its copyright notice are kept unchanged in [LICENSE](LICENSE).
- Under the Space Apps Terms, the team's original content must be openly available or carry an OSI-approved license. If no license is named, NASA distributes it under Apache-2.0.

> **Owner action:** choose and state a license for the new contributions. One option is MIT, with the team's copyright line added next to the existing one.
