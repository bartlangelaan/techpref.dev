import { createHash } from "node:crypto";
import { allRuleChecks } from "@/scripts/rules";

/**
 * Manual version bump. Increment this whenever the analysis logic changes in a
 * way that is not captured by the allRuleChecks hash (e.g. changes to the ESLint
 * plugin implementation).
 */
const versionNumber = 1;

/**
 * Generate a hash of the allRuleChecks object mixed with versionNumber.
 * This is used to detect when the analysis rules have changed.
 */
export function getAnalyzedVersion(): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(allRuleChecks));
  hash.update(String(versionNumber));
  return hash.digest("hex").slice(0, 12);
}
