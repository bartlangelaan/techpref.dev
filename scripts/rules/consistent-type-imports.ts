import type { OxlintRuleCheck } from "./index";

/**
 * consistent-type-imports rule checks (using Oxlint for faster analysis).
 * This rule enforces consistent use of type imports.
 *
 * - "type-imports" variant: Reports violations when type-only values are not imported with 'type' keyword
 * - "no-type-imports" variant: Reports violations when 'type' keyword is used for imports
 */
export const consistentTypeImportsChecks: OxlintRuleCheck[] = [
  {
    ruleId: "consistent-type-imports",
    variant: "type-imports",
    oxlintConfig: {
      rule: "typescript/consistent-type-imports",
      config: ["error", { prefer: "type-imports" }],
    },
  },
  {
    ruleId: "consistent-type-imports",
    variant: "no-type-imports",
    oxlintConfig: {
      rule: "typescript/consistent-type-imports",
      config: ["error", { prefer: "no-type-imports" }],
    },
  },
];
