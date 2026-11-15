import Link from "next/link";
import {investigationSummaries} from "@/lib/investigation-data";
import {SummaryLibrary} from "@/components/research/SummaryLibrary";
import s from "@/components/research/InvestigationSummary.module.css";
export const metadata={title:"Investigation summaries"};
export default function InvestigationLibrary(){return <div className={s.page}><Link className={s.back} href="/research#research-workspace">← Research dashboard</Link><SummaryLibrary studies={investigationSummaries.map(x=>({id:x.id,name:x.name,summary:x.study.summary,objective:x.study.objective,fuels:x.study.fuels,phase:x.study.phase,goals:x.study.goals,testCount:x.testCoverage.total,observationCount:x.findings.observed.length,contextCount:x.findings.context.length,ready:x.status.summaryAvailable,searchText:x.testCoverage.materials.join(" ")}))}/></div>;}
