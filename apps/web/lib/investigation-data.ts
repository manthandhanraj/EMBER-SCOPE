import investigations from "@/data/investigations.json";
import {evidenceRecords,findings,sources} from "./data";
import type {Investigation} from "./research";
import {summarizeInvestigation} from "./investigation-summary";

export const investigationSummaries=(investigations as Investigation[]).map(study=>summarizeInvestigation(study,evidenceRecords,findings,sources));
export const investigationSummary=(id:string)=>investigationSummaries.find(s=>s.id===id);
