# Source-linked investigation and application expansion

Checked 15 November 2026. This addition expands discovery and documented research applications. It does not establish scientific accuracy, operational fire-safety approval, or completeness of all NASA measurements.

## Curated profiles

The original seven IDs remain. Eight separate profiles were added: `spice`, `slice`, `cfi`, `cfi-g`, `efield`, `flex2`, `same-r`, `fm2`.

There are now 15 curated profiles, including combined discovery groups and specific follow-up investigations. This is not a count of 15 mutually exclusive NASA campaigns. Related profiles must not be added together as independent experiments. The separate PSI catalog retains NASA's own investigation records and identifiers.

Each profile retains an objective, material/fuel description, geometry, hardware, measurements, variables, gravity, limitations and original references. No publication excerpt or catalog objective is converted into an invented individual test row.

| Profile | Primary reference and scope |
| --- | --- |
| SPICE | [NASA investigation description](https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf); [PSI-107](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107), DOI 10.60555/9kbh-e962. Gas-jet smoke point is not detector sensitivity. |
| SLICE | [NASA description, PDF pages 1–2](https://www.nasa.gov/wp-content/uploads/2025/07/structure-liftoff-in-combustion-experiment-slice.pdf?emrc=da32af). Flame-base structure and liftoff objectives; not a solid-fuel limit. |
| CFI | [PSI-39](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39), DOI 10.60555/m6pj-a914. Liquid droplets; actual metadata is kept separate from the supplementary 2014 science-concept review. |
| CFI-G | [PSI-159](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159), DOI 10.60555/cyt1-kh64; [NASA presentation, PDF slide 6](https://ntrs.nasa.gov/citations/20220007191). Gaseous spherical-burner observations are distinct from liquid CFI. |
| E-FIELD Flames | [NASA Science](https://science.nasa.gov/biological-physical/investigations/e-field-flames/). Primarily terrestrial combustion-control research; the source explicitly disclaims a space-application objective. |
| FLEX-2 | [NASA combined document, PDF pages 3–4](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf?emrc=f75994); [PSI-68](https://psi.nasa.gov/physci/repo/data/investigations/PSI-68). Mixtures, relative flow and droplet interactions; original FLEX findings are not automatically duplicated. |
| SAME-R | [PSI-101](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101), DOI 10.60555/2np7-jv14. Modified materials, conditions and diagnostics; aggregate test count is distinct from imported source rows. |
| FM² | [NASA objectives and hardware](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/). Planned lunar-surface measurements, not a completed Moon-surface dataset or current launch-status assertion. |

## Corrected SAME source scope

The existing [NASA SAME / SAME-R document](https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf?emrc=b828be) contains results as well as objectives. PDF page 2 reports aggregate material-dependent smoke properties. Calling this entire source “objectives only” was too broad.

The added particle-size quotation is an aggregate publication result. Smoke-generation settings in an imported source table are not automatically detector response measurements. Neither establishes a validated model of sensitivity, false alarms or alarm time for a selected vehicle.

## New source and finding files

`apps/web/data/expanded-sources.json` follows the existing `Source` fields. `expanded-findings.json` follows `Finding`; all excerpts are short verbatim source passages with an explicit observation/context classification. The files leave original datasets unchanged.

| Source ID | Investigation family |
| --- | --- |
| same-results | same |
| slice-overview | slice |
| spice-overview | spice |
| cfi-concept | cfi |
| cfig-results | cfi-g |
| efield-overview | efield |
| flex2-overview | flex2 |
| same-r-psi | same-r |
| fm2-overview | fm2 |
| watermist-equipment | context |

The water-mist equipment observation is relevant research context, not an imported PSI solid-fuel test. The SAME-R catalog count is a reported aggregate, not that many newly created rows. CFI concept requirements, SLICE/FLEX-2 objectives and FM² planned measurements remain context. The CFI-G observation and SAME smoke-size finding retain their individual source scopes.

Six PDF byte hashes were retrieved and checked: SAME, SLICE, SPICE, ACME/CFI-G, FLEX/FLEX-2, and the water-mist technical brief. The old CFI concept PDF was readable through the source viewer but its direct file fetch failed; its hash remains null. HTML/PSI landing references also retain null file hashes. A null hash is disclosed missing file verification, not a fabricated checksum.

## Applications and equipment

`apps/web/data/research-applications.json` contains eight cards:

- Fine water mist: reported equipment proof-of-concept, orientation and breathing-protection compatibility.
- Smoke detection: aerosol spectrum and pre-fire source validation, including potential submarine/underwater-laboratory applications.
- Materials screening: geometry, oxygen, ventilation and gravity-specific comparison.
- Cool-flame diagnostics: separating visual disappearance from ongoing chemistry; cleaner-engine research.
- Electric-field control: terrestrial efficiency/emissions research, not demonstrated spacecraft suppression.
- Soot and stabilization modeling: SPICE/SLICE burner and flow configuration differences.
- Cabin-scale monitoring: Saffire alongside sample and smoke-measurement research.
- Firefighter protection: documented broader NASA technology heritage, explicitly not attributed to the listed PSI campaigns.

Card schema: `id`, `title`, `goal`, `application` (`spacecraft`, `earth`, `both`), `investigationIds`, `evidenceType` (`reported-technology`, `research-objective`, `publication-finding`), `summary`, `designImplication`, `limitations`, `sources` (`title`, `url`, `locator`), `checked`.

Design implications are project interpretations, not measured NASA outcomes or emergency instructions. Every card keeps its source and transfer limits.

## Review still needed

PSI-39 currently gives different pressure ranges in its objectives and approach. The profile flags this inconsistency and does not collapse them into a tested envelope; reconcile against the original test records before quantitative use.

Independent scientific/transcription review is still needed for all new excerpts and metadata. Equipment dose, detector thresholds, calibration, time histories and uncertainty require their original engineering/test evidence. Historical technology-transfer articles do not establish current product certification.
