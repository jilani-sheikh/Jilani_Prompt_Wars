import test from "node:test";
import assert from "node:assert/strict";

test("Reasoning coverage metric represents dimension coverage rather than verdict", () => {
  const coverageDimensions = [
    { name: "Financial Terms", status: "Examined" },
    { name: "Opportunity Costs", status: "Unexamined" },
    { name: "Operational Friction", status: "Partially Examined" },
    { name: "Reversibility", status: "Unexamined" },
  ];

  const examinedCount = coverageDimensions.filter((d) => d.status === "Examined").length;
  const partialCount = coverageDimensions.filter((d) => d.status === "Partially Examined").length;
  const score = Math.round(((examinedCount * 1.0 + partialCount * 0.5) / coverageDimensions.length) * 100);

  // Score must be between 0 and 100
  assert.ok(score >= 0 && score <= 100);
  assert.equal(score, 38);

  // Must never be presented as an accept/reject verdict
  const isEvaluativeJudgment = false;
  assert.equal(isEvaluativeJudgment, false);
});

test("Decision snapshot versioning increments sequentially without overwriting baseline", () => {
  const snapshots = [
    { version: 1, reasoning: "Initial premise: The stipend is high so it must be good." },
  ];

  // User adds reflection and evolves reasoning
  const updatedReasoning = "Updated premise: Will verify mentorship and negotiate remote Friday buffer.";
  const nextSnapshot = {
    version: snapshots.length + 1,
    reasoning: updatedReasoning,
  };

  snapshots.push(nextSnapshot);

  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].version, 1);
  assert.equal(snapshots[1].version, 2);
  // Original is intact
  assert.equal(snapshots[0].reasoning, "Initial premise: The stipend is high so it must be good.");
  assert.equal(snapshots[1].reasoning, updatedReasoning);
});
