import { createHash } from "node:crypto";
import { allRuleChecks } from "@/scripts/rules";

/**
 * Generate a hash of the allRuleChecks object.
 * This is used to detect when the analysis rules have changed.
 */
export function getAnalyzedVersion(): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(allRuleChecks));
  return hash.digest("hex").slice(0, 12);
}
