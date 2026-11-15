import { test } from "node:test";
import assert from "node:assert/strict";
import { checkedSummary, type CheckedClaim } from "./ask-core.ts";

test("the visible summary cannot repeat claims rejected by the evidence checker", () => {
  const bad: CheckedClaim = {text:"Invented probability: 99%",type:"DERIVED",cites:[],verified:false,issues:["unsupported"]};
  const good: CheckedClaim = {text:"No matching test is available.",type:"DATA_GAP",cites:[],verified:true,issues:[]};
  assert.equal(checkedSummary([bad, good]),good.text);
  assert.ok(!checkedSummary([bad]).includes("99%"));
  assert.match(checkedSummary([]),/No generated claims passed/);
});
