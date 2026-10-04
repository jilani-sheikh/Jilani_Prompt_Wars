import test from "node:test";
import assert from "node:assert/strict";
import { detectHighStakes } from "../src/lib/highStakes";

test("detectHighStakes flags medical decision and requires safety notice", () => {
  const query = "I am deciding whether to undergo elective spinal fusion surgery next month.";
  const result = detectHighStakes(query);

  assert.equal(result.isHighStakes, true);
  assert.equal(result.category, "medical");
  assert.equal(result.riskLevel, "High");
  assert.ok(result.safetyNotice && result.safetyNotice.includes("NOT medical advice"));
  assert.ok(result.guidanceFocus.length > 0);
});

test("detectHighStakes flags legal decision and directs to legal counsel", () => {
  const query = "My former co-founder is threatening a lawsuit over intellectual property in court.";
  const result = detectHighStakes(query);

  assert.equal(result.isHighStakes, true);
  assert.equal(result.category, "legal");
  assert.equal(result.riskLevel, "High");
  assert.ok(result.safetyNotice && result.safetyNotice.includes("NOT constitute legal advice"));
});

test("detectHighStakes flags safety-critical decision", () => {
  const query = "Should we continue factory operations during a toxic chemical hazard emergency?";
  const result = detectHighStakes(query);

  assert.equal(result.isHighStakes, true);
  assert.equal(result.category, "safety");
  assert.equal(result.riskLevel, "High");
  assert.ok(result.safetyNotice && result.safetyNotice.includes("emergency"));
});

test("detectHighStakes treats career choice as standard non-high-stakes", () => {
  const query = "Should I accept this 6-month frontend internship in Pune?";
  const result = detectHighStakes(query);

  assert.equal(result.isHighStakes, false);
  assert.equal(result.safetyNotice, null);
  assert.equal(result.riskLevel, "General");
});
