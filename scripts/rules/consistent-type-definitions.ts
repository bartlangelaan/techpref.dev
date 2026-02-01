import type { OxlintRuleCheck } from "./index";

/**
 * consistent-type-definitions rule checks (using Oxlint for faster analysis).
 * This rule enforces a consistent way of defining object types.
 *
 * - "interface" variant: Reports violations when type keyword is used for object types
 * - "type" variant: Reports violations when interface keyword is used
 */
export const consistentTypeDefinitionsChecks: OxlintRuleCheck[] = [
  {
    ruleId: "consistent-type-definitions",
    variant: "interface",
    oxlintConfig: {
      rule: "typescript/consistent-type-definitions",
      config: ["error", "interface"],
    },
  },
  {
    ruleId: "consistent-type-definitions",
    variant: "type",
    oxlintConfig: {
      rule: "typescript/consistent-type-definitions",
      config: ["error", "type"],
    },
  },
];
