import type { OxlintRuleCheck } from "./index";

/**
 * consistent-generic-constructors rule checks (using Oxlint for faster analysis).
 * This rule enforces a consistent way of writing generic constructors.
 *
 * - "constructor" variant: Reports violations when generic parameter is on the type instead of constructor
 * - "type-annotation" variant: Reports violations when generic parameter is on the constructor instead of type
 */
export const consistentGenericConstructorsChecks: OxlintRuleCheck[] = [
  {
    ruleId: "consistent-generic-constructors",
    variant: "constructor",
    oxlintConfig: {
      rule: "typescript/consistent-generic-constructors",
      config: ["error", "constructor"],
    },
  },
  {
    ruleId: "consistent-generic-constructors",
    variant: "type-annotation",
    oxlintConfig: {
      rule: "typescript/consistent-generic-constructors",
      config: ["error", "type-annotation"],
    },
  },
];
