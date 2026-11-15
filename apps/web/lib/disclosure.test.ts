// License and reuse disclosure: the hosted copies must match the project documents, and the default
// local model must stay under an OSI open-source license (2026 Space Apps Terms, third-party materials).
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {localChatModel} from "./local-ai.ts";

const text=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8").replace(/\r\n/g,"\n");
const PAIRS:[string,string][]=[
 ["../../../LICENSE","../public/LICENSE.txt"],
 ["../../../THIRD_PARTY_NOTICES.md","../public/THIRD_PARTY_NOTICES.txt"],
 ["../../../REFERENCES.md","../public/REFERENCES.txt"],
 ["../../../docs/ORIGINAL-CONTRIBUTIONS.md","../public/ORIGINAL-CONTRIBUTIONS.txt"],
];

test("hosted license and disclosure copies match the project documents", () => {
 for(const [project,hosted] of PAIRS)assert.equal(text(hosted),text(project),`${hosted} is out of date; copy it from ${project}`);
});

test("default local chat model is OSI-licensed and is the one cited in REFERENCES.md", () => {
 const previous=process.env.OLLAMA_MODEL;delete process.env.OLLAMA_MODEL;
 try{
  const model=localChatModel();
  assert.doesNotMatch(model,/^qwen2\.5:(3b|72b)/,"qwen2.5 3B/72B use non-OSI Qwen licenses");
  assert.ok(text("../../../REFERENCES.md").includes(`\`${model}\``),`REFERENCES.md does not cite ${model}`);
 }finally{if(previous!==undefined)process.env.OLLAMA_MODEL=previous;}
});

test("upstream MIT copyright notice is retained", () => {
 assert.match(text("../../../LICENSE"),/Copyright \(c\) 2026 AKM Asifuzzaman/);
 assert.match(text("../../../LICENSE"),/Permission is hereby granted, free of charge/);
});
