import type { OxlintRuleCheck } from "./index";

/**
 * consistent-indexed-object-style rule checks (using Oxlint for faster analysis).
 * This rule enforces a consistent way of defining object indexed properties.
 *
 * - "record" variant: Reports violations when Record<K, V> syntax is not used
 * - "index-signature" variant: Reports violations when Record<K, V> syntax is used instead of index signatures
 */
export const consistentIndexedObjectStyleChecks: OxlintRuleCheck[] = [
  {
    ruleId: "consistent-indexed-object-style",
    variant: "record",
    oxlintConfig: {
      rule: "typescript/consistent-indexed-object-style",
      config: ["error", "record"],
      plugins: ["typescript"],
    },
  },
  {
    ruleId: "consistent-indexed-object-style",
    variant: "index-signature",
    oxlintConfig: {
      rule: "typescript/consistent-indexed-object-style",
      config: ["error", "index-signature"],
      plugins: ["typescript"],
    },
  },
];
