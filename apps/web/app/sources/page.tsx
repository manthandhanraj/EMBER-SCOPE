import type { Metadata } from "next";
import { findings, sources } from "@/lib/data";
import investigations from "@/data/investigations.json";
import Link from "next/link";

export const metadata: Metadata = { title: "Sources" };

const DOWNLOADS: [file: string, label: string, note: string][] = [
  ["bass2-tests.csv", "BASS-II test records (CSV)", "Every test row: material, oxygen, pressure, airflow, outcome, NASA notes."],
  ["saffire-runs.csv", "Saffire runs (CSV)", "Large-scale spacecraft fires: conditions and measured results."],
  ["luci-runs.csv", "LUCI lunar-gravity burns (CSV)", "Two burns in simulated lunar gravity, each value with its NASA sentence and page."],
  ["findings.json", "Findings (JSON)", "NASA publication excerpts with source/page links; independent review remains required."],
  ["source-manifest.json", "Source manifest (JSON)", "NTRS records, PDF links and SHA-256 hashes."],
  ["investigations.json", "Investigation overviews (JSON)", "Objectives, hardware, variables, source links and evidence limits; not numerical results."],
  ["evidence-graph.json", "Evidence graph (JSON)", "Families, sources, records, findings and mission questions, with typed links."],
];

export default function SourcesPage() {
  return (
    <div className="explorer-page sources-page mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <p className="text-signal text-sm">SOURCE LIBRARY</p>
      <h1 className="display text-4xl sm:text-5xl mt-3">Trace the research to its sources.</h1>
      <div className="mt-6"></div>
      <p className="mt-3 text-muted max-w-[70ch]">
        Source manifests for NASA technical reports, official investigation pages and the separately imported PSI catalog. Available hashes let you compare original bytes; an absent hash remains unknown. Preserve each source rights and DOI information.
      </p>
      <section aria-labelledby="downloads" className="mt-8 rounded-2xl border border-[var(--rule-strong)] p-5">
        <h2 id="downloads" className="text-lg font-semibold">Download the data</h2>
        <p className="mt-1 text-sm text-muted max-w-[70ch]">
          Everything the atlas shows, as plain files. Each row keeps its NASA source and PDF page, so you can check it yourself.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DOWNLOADS.map(([file, label, note]) => (
            <li key={file}>
              <a href={`/downloads/${file}`} download className="link font-semibold">{label}</a>
              <span className="block text-sm text-muted">{note}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 rounded-2xl border border-rule p-5">
        <h2 className="text-xl font-semibold">Investigation overview references</h2>
        <p className="text-muted text-sm mt-3">These official overview/design references describe scope. They do not add measured results to the curated test tables. The publication manifest below remains separate.</p>
        <ul className="mt-4 space-y-3">{investigations.map(study=><li key={study.id}><a className="link" href={study.source} target="_blank" rel="noreferrer">{study.name} — {study.sourceLabel} ↗</a><p className="text-sm text-muted mt-1">{study.evidenceLevel}</p></li>)}</ul>
        <p className="mt-5"><Link className="link" href="/data-guide">How to collect missing data and review findings →</Link></p>
      </section>
      <ol className="mt-10 space-y-10">
        {sources.map((s) => {
          const n = findings.filter((f) => f.source_id === s.source_id).length;
          return (
            <li key={s.source_id} className="source-document">
              <h2 className="text-lg font-semibold max-w-[70ch]">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {s.authors.join(", ")}
                {s.published && `. ${s.published.slice(0, 4)}`}. {s.document_type?.toLowerCase().replace(/_/g, " ")}.
              </p>
              <p className="mt-3 text-[15px]">{s.used_for}.</p>
              <dl className="mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-1 text-sm">
                <dt className="text-muted">Original source</dt>
                <dd>
                  <a href={s.url} className="link" target="_blank" rel="noreferrer">
                    {s.ntrs_id||"NASA / PSI source"}
                  </a>
                  {s.pdf_url && (
                    <>
                      {" "}
                      ·{" "}
                      <a href={s.pdf_url} className="link" target="_blank" rel="noreferrer">
                        PDF
                      </a>
                    </>
                  )}
                </dd>
                <dt className="text-muted">Copyright</dt>
                <dd>{s.copyright?.toLowerCase().replace(/_/g, " ") ?? "not stated"}</dd>
                <dt className="text-muted">SHA-256</dt>
                <dd className="break-all text-faint">{s.sha256 ?? "metadata-only record, no PDF on NTRS"}</dd>
                <dt className="text-muted">Quoted here</dt>
                <dd>{n === 0 ? "not quoted, data or context only" : `${n} finding${n === 1 ? "" : "s"}`}</dd>
              </dl>
              {s.abstract && (
                <details className="mt-3">
                  <summary className="text-sm text-signal cursor-pointer">Abstract</summary>
                  <p className="mt-2 text-[15px] text-muted whitespace-pre-line">{s.abstract}</p>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
