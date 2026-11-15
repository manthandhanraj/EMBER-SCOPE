# Tumhe kaunsa research data lana hai

Main deliverable research dashboard hai. Har claim ka original source aur limits chahiye; sirf videos se detector performance validate nahi hoga.

15 November update: `/psi` mein actual public repository se 24 metadata entries aur saare 22 experimental tables ke 2,009 rows already imported hain. Inka harmonized view (607 model-ready rows) bhi wahin hai. `/model-lab` inko original cells/provenance ke saath export karta hai. In rows ko 78 curated outcome records ke saath add karke unique-test count mat banana. SAME ka published smoke-size result bhi available hai; ab missing task detector calibration/response/time-history aur independent validation hai. Owner ke saare steps parent `MORNING-CHECKLIST.md` mein hain.

## 1. Official sources

- NASA PSI: https://psi.nasa.gov — combustion investigation entries aur data-access instructions dekho. Challenge ke Resources tab ki complete list bhi do; supplied screenshots mein list nahi thi.
- NASA NTRS: https://ntrs.nasa.gov — investigation name se reports/papers lao. BASS-II starting report: https://ntrs.nasa.gov/citations/20210011385
- SAME, Saffire, FLEX, ACME aur SoFIE links dashboard mein hain. Raw data unavailable ho toh official investigator/data-contact se test tables, logs, sensor configuration aur usage terms request karo.
- Original filename, stable URL, document ID, version, access date aur rights save karo. Overview page measured dataset nahi hai.

## 2. Study/run metadata

Use templates/research-investigations.csv and templates/research-findings.csv.

Objective; actual test ID; material composition; geometry/thickness/scale; true/simulated gravity and platform; oxygen and basis; pressure; airflow/direction/history; ignition/suppression; hardware/sensor calibration; variables and units; sampling; uncertainty; outcome definition; source table/page; confounders.

Unknown blank rakho. Overview entry mein invented test ID/results mat bharna. Different fuel phases, apparatus, sample reuse aur edited footage equivalent tests nahi hain. New CSV records need deliberate import and review; edits automatically scientific results publish nahi karti.

## 3. Detection ke missing inputs

SAME objectives available hain; numerical performance rows current corpus mein nahi. Aerosol material/size/concentration, airflow, detector type/response/timing, reference measurements, calibration, repeated runs aur false-alarm definitions/data lao. Flame outcomes se smoke-detector accuracy calculate nahi hoti.

## 4. Human validation

Use templates/research-review.csv. Tuning se pehle held-out questions fix karo: prevention, detection, suppression, unsupported material, lunar/Martian transfer, missing conditions aur conflicting studies. Do independent reviewers study relevance/rank, source passage support, numbers, units, context aur missing studies assess karein. Disagreements aur adjudication record karo.

Retrieval relevance, citation support, numerical/context errors, unanswered-question handling aur reviewer agreement separately report karo. UI ko 'looks good' bolna scientific validation nahi. Evaluation hone tak accuracy/time-saving percentage unknown rahega.

## 5. Handoff

Official files + metadata/findings CSV + rights information + held-out questions + independent reviews + disagreement/adjudication notes. Optional AI key sirf local apps/web/.env.local mein rakho, chat mein nahi.

## Investigation brief ko validate kaise karna hai

`/investigations` se har group ka detailed brief aur JSON/Markdown download karo. Original report ke saath objective, apparatus, fuels, geometry, measurements aur variables cross-check karo; field-specific source/page ya section record karo. Har quotation ko linked PDF page par verify karo. Numerical spans ke bajay individual linked test rows se values, units, unknowns aur experimental differences check karo.

Missing tables milne par actual test rows aur source IDs ke saath templates bharo. SAME ke objectives ko numerical detector results mat samjho; SoFIE program context ko GEL measured result mat banao; historical launch plans ke liye dated source chahiye. Revised metadata belongs in `apps/web/data/investigations.json`; reviewed test/finding additions need the corresponding dataset and source-manifest updates. CSV upload automatic import nahi karta. Review notes ko `templates/research-review.csv` ke format mein separately save karo; brief availability ko expert approval mat samjho.

Research discovery aur interpretation ki validation operational fire procedures/material certification ka substitute nahi hai.
