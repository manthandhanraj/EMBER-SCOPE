import Link from "next/link";
export const metadata={title:"Research data & human review guide"};
export default function DataGuide(){
  return <article className="mx-auto max-w-4xl px-6 py-16 text-ink">
    <p className="text-signal text-sm">DATA COLLECTION / INDEPENDENT REVIEW</p>
    <h1 className="text-4xl font-semibold mt-4 mb-8">Build a stronger research evidence base.</h1>
    <p className="text-muted">Collect official investigation records, numerical test tables and source-linked findings. A study objective or public video is not a measured performance result.</p>
    <h2 className="text-2xl mt-10 mb-4">1. Find official sources</h2>
    <p className="text-muted">Start with <a className="link" href="https://psi.nasa.gov" target="_blank" rel="noreferrer">NASA PSI</a>, <a className="link" href="https://ntrs.nasa.gov" target="_blank" rel="noreferrer">NASA NTRS</a>, and original investigation links in the dashboard. Keep document ID, stable URL, filename, version, access date and rights. If raw tables are unavailable, contact the investigator listed on the official entry. Supplied challenge screenshots did not include the complete Resources tab.</p>
    <h2 className="text-2xl mt-10 mb-4">2. Record study and test metadata</h2>
    <p className="text-muted">Collect objectives, actual test ID, fuel/material, geometry, apparatus, sensor calibration, gravity/platform, oxygen basis, pressure, flow history, ignition/suppression, variables, units, uncertainty and source table/page. Use project research CSV templates. Unknown values stay blank; overviews stay labelled. New records require deliberate import and review.</p>
    <h2 className="text-2xl mt-10 mb-4">3. Fill the detection evidence gap</h2>
    <p className="text-muted">SAME includes published smoke-property observations. The imported SAME and SAME-R PSI tables contain source experiment metadata, not a validated detector-performance dataset. Obtain detector configuration and response, reference measurements, timing, airflow, calibration, repeated runs and false-alarm definitions. Solid-fuel flame outcomes and setup rows cannot establish smoke-detector accuracy. <Link className="link" href="/psi">Inspect the imported tables →</Link></p>
    <h2 className="text-2xl mt-10 mb-4">4. Review research answers independently</h2>
    <p className="text-muted">Fix held-out prevention, detection, suppression, missing-data and gravity-transfer questions before tuning. Two reviewers should independently assess relevant studies, ranking, cited passages, numbers, units and unsupported interpretations. Record disagreements and adjudication using the research-review template. Report retrieval relevance, citation support, context errors and unanswered-question handling separately.</p>
    <h2 className="text-2xl mt-10 mb-4">5. Supply a traceable handoff</h2>
    <p className="text-muted">Original source files, metadata and finding CSVs, rights information, held-out questions, independent reviews and disagreement notes. Configure optional provider keys only locally. No paid key is needed for library, comparison, sources or exports.</p>
    <p className="mt-10"><Link className="link" href="/research">Open research dashboard →</Link></p>
    <p className="text-sm text-muted mt-8">Missing scientific evidence and expert validation are unresolved inputs. Scores and automatic checks are not spacecraft safety certification.</p>
  </article>;
}
