# EmberScope — Space Apps submission answers

Prepared from the supplied recording and current local project on 15 November 2026. This is a draft for the owner to review and paste; no form was filled or submitted. It does not assert eligibility, independent scientific validation or a deployed public AI service.

## 1. Project Name

EmberScope: Flame in Freefall

## 2. Summary

EmberScope is an AI-assisted research dashboard that turns NASA microgravity combustion data into traceable fire-safety insights. Built for the Flame in Freefall challenge, it helps researchers explore investigations, compare experimental conditions and prioritize evidence for spacecraft, space stations, lunar and Martian habitats, and pressurized rovers.

The app imports 22 experimental tables from NASA's Physical Sciences Informatics repository, preserving 2,009 source rows alongside a 24-entry catalog. It combines 15 research profiles with visual comparisons of oxygen, airflow, materials, gravity and reported outcomes. A modeling workspace prepares source-linked datasets, while configured AI models support semantic ranking and evidence-grounded explanations.

EmberScope highlights prevention, detection and suppression research, including potential Earth applications. It separates observations from interpretations, flags missing data and links conclusions to original sources. The prototype supports research discovery and exploratory modeling; it does not certify fire safety. Its licensed open-source foundation and AI-assisted development are disclosed.

145 words; 1172 characters including paragraph breaks. The recorded field limit is 1,500 characters.

## 3. Project Demonstration

Enter the actual public URL of a project demo: a video no longer than 30 seconds, or no more than 7 slides including title/introduction. The URL must open without a login, password or permission request. The supplied recording shows the submission form and is not a demonstration of EmberScope. No demo URL was provided in this chat, so one has not been invented.

Suggested narration (confirm final recorded duration):

Meet EmberScope: a research dashboard for NASA's Flame in Freefall challenge. Explore source-linked combustion studies, compare oxygen and airflow conditions, and follow the evidence toward prevention, detection and suppression research. Prepare data for modeling and export a clear research brief. Missing evidence and transfer limits stay visible. EmberScope supports research discovery, not certified fire prediction.

## 4. Project

https://github.com/manthandhanraj/EMBER-SCOPE

Use this only if the repository is Public and contains the final project. A working public deployment URL may be used instead; no deployed URL was provided here. Avoid localhost links.

## 5. Project Details

EmberScope addresses NASA's Flame in Freefall challenge by organizing combustion investigations into an evidence-driven research workflow: Explore, Compare, Insights and Report. Its intended audience is researchers and engineers investigating fire prevention, detection, suppression and the preparation of flammability-modeling datasets.

The application connects a reproducible snapshot of NASA's Physical Sciences Informatics (PSI) repository with NASA publications and investigation overviews. It includes 24 combustion catalog entries and all 22 experimental tables listed in that snapshot, containing 2,009 source rows. These rows are kept separate from the 78 curated solid-fuel records inherited from the project's open-source foundation. Source rows can describe different kinds of measurements or setups; they are not automatically independent, comparable fire tests.

Fifteen source-linked profiles cover investigation families and follow-ups including BASS/BASS-II, Saffire, SAME/SAME-R, FLEX/FLEX-2, ACME, SoFIE-GEL, LUCI, SPICE, SLICE, CFI/CFI-G, E-FIELD and FM2. Users can inspect objectives, materials, geometry, apparatus, measurements, reported findings and limitations. The interactive evidence map and visual reports help explain connections and differences without presenting those connections as proof of causation.

Research ranking combines the selected safety goal, question similarity, joint experimental conditions, habitat priorities and evidence availability. Local AI integration supports neural similarity and source-grounded explanations when the required models are available. Ranking components and fallback behavior are disclosed. The scores prioritize research; they are not fire-risk probabilities, detector accuracy or safety certification. Local inference uses Ollama, Qwen2.5-7B-Instruct and all-MiniLM-L6-v2. Hosted AI generation requires a separately configured provider.

The model workspace prepares data for catalog, ignition and spread-rate tasks, retaining source identifiers, exclusions and conservative grouping for dataset splits. The harmonized PSI view preserves original values and explicit units. Missing, ranged, listed or censored values are flagged rather than invented. Material charts show oxygen and airflow conditions, observed outcomes and partial-gravity coverage. Exploratory modeling is bounded by the available evidence and is not a validated general spacecraft-fire predictor.

The intended benefit is to make relevant NASA research easier to discover, compare and audit before planning experiments or developing models. Source-linked application cards connect the research to smoke detection, fine-water-mist suppression, equipment and potential Earth benefits. No measured reduction in research time or independently validated safety improvement is claimed.

The web application uses Next.js, React, TypeScript, CSS and Node.js. Python supports reproducible data ingestion and verification. The interface provides larger readable text, light/dark modes, accessible motion controls, comparison tables, charts and printable or downloadable research briefs. Automated software checks and local browser checks support implementation quality; independent scientific review remains necessary.

EmberScope extends MIT-licensed MicroFire Atlas by AKM Asifuzzaman. Retained code, curated records and original notices are credited in LICENSE, THIRD_PARTY_NOTICES.md and REFERENCES.md. Our additions include the PSI ingestion and harmonization, researcher-focused summaries, research ranking, model-data workspace, applications content, visual reporting and redesigned interface. OpenAI ChatGPT/Codex assisted coding, documentation and design, and the built-in image tool produced the decorative chamber artwork. The illustration is conceptual; scientific measurements are sourced from NASA rather than generated by AI.

## 6. Use of Super Intelligence (SI)

The dropdown choices were not opened in the recording, so their exact labels are unknown. Select the available categories matching AI-assisted coding, text/documentation, image generation and runtime language/embedding models. Do not select “I did not use SI.” Do not select audio/video generation merely because you record a normal screen demo. If other tools such as Claude/Claude Code were used by team members, add those as well; the current references mention them, but the owner should confirm actual use.

If an explanation field appears, use:

OpenAI ChatGPT/Codex assisted software development, debugging, interface design and documentation. OpenAI's built-in image tool generated and edited the decorative combustion-chamber illustration. The application integrates Ollama with Qwen2.5-7B-Instruct for source-grounded explanations and all-MiniLM-L6-v2 for semantic ranking when configured. Scientific data remains source-linked and distinct from generated explanations. AI-assisted outputs require review against their cited sources.

The recorded form explicitly requires a visible SI-generated watermark for generated images/videos, and acknowledgement of SI-generated code/data in descriptive text and metadata. The current chamber caption says “CONCEPT ILLUSTRATION”; add an explicit “AI-GENERATED CONCEPT ILLUSTRATION” label before recording/publishing the demo. Keep the artwork prompt/provenance and development disclosures with the project. Do not label NASA source measurements as AI-generated.

## 7. NASA Data — Link Text / Link URL

Add the following entries with Add New Link. PSI dataset DOIs are retained as stable identifiers; individual source rights and versions are documented in REFERENCES.md. Metadata-only catalog entries are not represented as imported experimental tables. Media links reflect the project's existing reference inventory; remove any entry only if the final submission genuinely no longer uses it.

| Link Text | Link URL |
| --- | --- |
| NASA Physical Sciences Informatics (PSI) | https://psi.nasa.gov |
| NASA PSI Combustion Science catalog snapshot source | https://psi.nasa.gov/geode-py/ws/repo/search?source=psi&type=investigation&size=100&ffield=Research+Area&fvalue=Combustion+Science |
| PSI-10 — Advanced Combustion via Microgravity Experiments / Flame Design | https://doi.org/10.60555/w4zy-bt45 |
| PSI-100 — Spacecraft Fire Experiment-III | https://doi.org/10.60555/040q-4h36 |
| PSI-101 — Smoke Aerosol Measurement Experiment-Reflight | https://doi.org/10.60555/2np7-jv14 |
| PSI-102 — Smoke and Aerosol Measurement Experiment | https://doi.org/10.60555/gd4k-8h62 |
| PSI-106 — Structure and Liftoff In Combustion Experiment | https://doi.org/10.60555/pm12-rg61 |
| PSI-107 — Smoke Point In Co-flow Experiment | https://doi.org/10.60555/9kbh-e962 |
| PSI-115 — Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity | https://doi.org/10.60555/q0v5-1v28 |
| PSI-117 — Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis | https://doi.org/10.60555/gz0q-b577 |
| PSI-142 — Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames | https://doi.org/10.60555/80qf-vj95 |
| PSI-159 — Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases | https://doi.org/10.60555/cyt1-kh64 |
| PSI-20 — Advanced Combustion via Microgravity Experiments - Burning Rate Emulator | https://doi.org/10.60555/vb93-3y72 |
| PSI-21 — Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame | https://doi.org/10.60555/23e1-9950 |
| PSI-22 — Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames | https://doi.org/10.60555/se5a-8c73 |
| PSI-23 — Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames | https://doi.org/10.60555/k57n-p030 |
| PSI-25 — Burning and Suppression of Solids - II | https://doi.org/10.60555/4qc4-de67 |
| PSI-26 — Burning and Suppression of Solids | https://doi.org/10.60555/58h4-dy80 |
| PSI-39 — Cool Flames Investigation | https://doi.org/10.60555/m6pj-a914 |
| PSI-47 — Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2 | https://doi.org/10.60555/ztgj-d202 |
| PSI-60 — Computational and Experimental Analysis of SPICE Data Sets | https://doi.org/10.60555/mzjm-yv57 |
| PSI-62 — Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography | https://doi.org/10.60555/e9xp-ex83 |
| PSI-68 — Flame Extinguishment Experiment - 2 | https://doi.org/10.60555/byp8-h018 |
| PSI-69 — Flame Extinguishment Experiment | https://doi.org/10.60555/mbq8-0451 |
| PSI-98 — Spacecraft Fire Safety Experiment-I | https://doi.org/10.60555/0t15-1z43 |
| PSI-99 — Spacecraft Fire Experiment-II | https://doi.org/10.60555/2chp-m469 |
| Burning and Suppression of Solids–II  (BASS-II) Summary Report | https://ntrs.nasa.gov/citations/20210011385 |
| Combustion of Solids in Microgravity: Results from the BASS-II Experiment | https://ntrs.nasa.gov/citations/20160000593 |
| Microgravity Flammability of PMMA Rods in Concurrent Flow | https://ntrs.nasa.gov/citations/20150008961 |
| Concurrent Flame Growth, Spread and Extinction over Composite Fabric Samples in Low Speed Purely Forced Flow in Microgravity | https://ntrs.nasa.gov/citations/20150008962 |
| Thickness and Fuel Preheating Effects on Material Flammability in Microgravity from the BASS Experiment | https://ntrs.nasa.gov/citations/20140011099 |
| Effects of Confinement on Flame Spread in Microgravity | https://ntrs.nasa.gov/citations/20205004657 |
| Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test | https://ntrs.nasa.gov/citations/20130010991 |
| Lunar Combustion Investigation: Flammability Results from a Rotating Sounding Rocket | https://ntrs.nasa.gov/citations/20250010653 |
| Results of a 3-day Pilot Study to Validate Planetary Prebreathe Protocols Using a 56.5 kPa 34% O2, 66% N2 Saturation Cabin Atmosphere | https://ntrs.nasa.gov/citations/20220009546 |
| Nasa Exploration Atmosphere Tests 3 & 4: Development and Validation of Planetary Extravehicular Activity Prebreathe Protocols for Alternate Atmospheres and Suit Pressures | https://ntrs.nasa.gov/citations/20240013238 |
| Flammability of Materials on the Moon | https://ntrs.nasa.gov/citations/20240008623 |
| Flammability of Materials on the Moon | https://ntrs.nasa.gov/citations/20240015307 |
| NASA Exploration Atmosphere Test 6: Back to Back EVAs | https://ntrs.nasa.gov/citations/20260003261 |
| Results of Large-Scale Spacecraft Flammability Tests | https://ntrs.nasa.gov/citations/20170008805 |
| Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires | https://ntrs.nasa.gov/citations/20210017780 |
| Preliminary Results from the Saffire VI Experiment | https://ntrs.nasa.gov/citations/20240002981 |
| Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011 | https://ntrs.nasa.gov/citations/20150023456 |
| Solid Fuel Ignition and Extinction (SoFIE) Project on ISS | https://ntrs.nasa.gov/citations/20200000361 |
| Advanced Combustion via Microgravity Experiments (ACME) on the International Space Station (ISS) | https://ntrs.nasa.gov/citations/20210015913 |
| Smoke Aerosol Measurement Experiment (SAME) and SAME-R | https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf?emrc=b828be |
| Structure & Liftoff in Combustion Experiment (SLICE) | https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf?emrc=da32af |
| Smoke Point in Co-flow Experiment (SPICE) | https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf |
| Cool Flame Investigation: Science Concept Review — Objectives and Requirements Definition | https://www1.grc.nasa.gov/wp-content/uploads/CFI_SCR_May_2014_Dietrich_v1.pdf |
| Laminar Non-Premixed Flames of Gaseous Fuel: ACME presentation | https://ntrs.nasa.gov/citations/20220007191 |
| Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames) | https://science.nasa.gov/biological-physical/investigations/e-field-flames/ |
| Flame Extinguishment Experiment (FLEX), FLEX-2 and FLEX-2J | https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf?emrc=f75994 |
| NASA PSI-101: Smoke Aerosol Measurement Experiment-Reflight (SAME-R) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-101 |
| Flammability of Materials on the Moon (FM²) | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/ |
| Fine-Water-Mist Multiple-Orientation-Discharge Fire Extinguisher | https://ntrs.nasa.gov/citations/20100001376 |
| acme | https://science.nasa.gov/mission/acme/ |
| sofie gel | https://science.nasa.gov/biological-physical/investigations/sofie-gel/ |
| studying combustion and fire safety | https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/ |
| GRC 2021 CN 00008 | https://images.nasa.gov/details/GRC-2021-CN-00008 |
| Saf VI%20S8C3%2BC4%201 sided%20PMMA_unmapped_jpeg 20x%20no%20text | https://images.nasa.gov/details/Saf-VI%20S8C3%2BC4%201-sided%20PMMA_unmapped_jpeg-20x%20no%20text |
| iss035e015900 | https://images.nasa.gov/details/iss035e015900 |
| iss040e086481 | https://images.nasa.gov/details/iss040e086481 |

## 8. Space Agency Partner & Other Data — Link Text / Link URL

The verified foundation and direct tools are below. Add any further tools actually used by the team. REFERENCES.md lists individual dependencies/licenses and the reuse breakdown; retain it in the public repository.

| Link Text | Link URL |
| --- | --- |
| MicroFire Atlas — AKM Asifuzzaman; reused MIT-licensed code and curated evidence | https://github.com/A-K-M-Asifuzzaman/MicroFire-Atlas |
| OpenAI ChatGPT / Codex and built-in image-generation tool — development and decorative artwork | https://openai.com/ |
| Ollama — local model runtime, MIT | https://github.com/ollama/ollama |
| Qwen2.5-7B-Instruct — local explanation model, Apache-2.0 | https://huggingface.co/Qwen/Qwen2.5-7B-Instruct |
| all-MiniLM-L6-v2 — neural embeddings, Apache-2.0 | https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 |
| Next.js — web framework, MIT | https://nextjs.org/ |
| React — interface library, MIT | https://react.dev/ |
| TypeScript — programming language, Apache-2.0 | https://www.typescriptlang.org/ |
| Tailwind CSS — styling infrastructure, MIT | https://tailwindcss.com/ |
| Node.js — web runtime | https://nodejs.org/ |
| Python — data-ingestion and verification scripts | https://www.python.org/ |
| Anthropic TypeScript SDK — optional provider integration, MIT | https://github.com/anthropics/anthropic-sdk-typescript |
| ESLint — development checks, MIT | https://eslint.org/ |

## 9. Project Submission Verification

“Agree to Terms and Conditions” is your own declaration: read the guide/terms and select it only if you agree. “Confirm All Work is Original” must reflect the actual contribution and complete external-resource disclosure. This project reuses MicroFire Atlas, which its author also identifies as a Space Apps project; an MIT license and attribution do not by themselves determine event eligibility. Do not claim the whole codebase was independently written. Check event-specific originality requirements with the organizers where necessary.

Recorded form instructions say Save Progress saves edits but does not submit for judging. After reviewing required fields and public access, the owner must use Submit for Judging and confirm the success notification. The recording states a deadline of 15 November 2026, 11:59 PM in the applicable local-event timezone; Universal Event follows the Team Owner's residence timezone.

Official terms: https://www.spaceappschallenge.org/legal/
Official guide: https://www.spaceappschallenge.org/resources/project-submission-guide/
