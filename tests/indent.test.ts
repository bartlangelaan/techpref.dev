import assert from "node:assert/strict";
import { test } from "node:test";
import { getBasicStats } from "@/lib/analysis-results";

void test("mattermost/mattermost is verdicted as 2-space indentation", () => {
  const stats = getBasicStats<"2-space" | "4-space" | "tab">("indent");

  const mattermost = stats.allVerdicts.find(
    (v) => v.repoFullName === "mattermost/mattermost",
  );

  assert.ok(mattermost, "mattermost/mattermost should be in the verdicts");
  assert.strictEqual(
    mattermost.verdict,
    "2-space",
    `Expected verdict '2-space' but got '${mattermost.verdict}'`,
  );
});
