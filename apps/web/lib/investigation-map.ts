import type { Investigation } from "./research.ts";
import type { EvidenceRecord } from "./ontology.ts";
import { SOURCE_FAMILY } from "./ontology.ts";
import type { Finding, Source } from "./types.ts";

export type MapInvestigation = Investigation & {
  testCount: number;
  findingCount: number;
  references: { id: string; title: string; href: string; kind: "overview" | "publication" }[];
  excerpts: { id: string; quote: string; kind: string; href: string; citation: string }[];
};

/** Edges express corpus membership and provenance, never causal or numerical similarity. */
export function investigationMap(studies: Investigation[], records: EvidenceRecord[], findings: Finding[], sources: Source[]): MapInvestigation[] {
  return studies.map(study => {
    const belongs = (sourceId: string) => study.familyIds.includes(SOURCE_FAMILY[sourceId] ?? "context");
    const linked = findings.filter(f => belongs(f.source_id));
    const refs: MapInvestigation["references"] = [
      {id: `overview:${study.id}`, title: study.sourceLabel, href: study.source, kind: "overview"},
      ...sources.filter(s => belongs(s.source_id)).map(s => ({id: s.source_id, title: s.title, href: s.url, kind: "publication" as const})),
    ];
    const unique = refs.filter((r, i) => refs.findIndex(x => x.href === r.href) === i);
    return {...study, testCount: records.filter(r => study.familyIds.includes(r.family)).length,
      findingCount: linked.length, references: unique,
      excerpts: linked.slice(0, 4).map(f => {
        const source = sources.find(s => s.source_id === f.source_id);
        return {id: f.id, quote: f.quote, kind: f.kind,
          href: f.pdf_page && source?.pdf_url ? `${source.pdf_url}#page=${f.pdf_page}` : source?.url ?? study.source,
          citation: `${f.source_id} · ${f.in === "abstract" ? "abstract" : `PDF page ${f.pdf_page ?? "not curated"}`}`};
      })};
  });
}
