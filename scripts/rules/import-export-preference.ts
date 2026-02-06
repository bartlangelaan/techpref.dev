import type { OxlintRuleCheck } from "./index";

/**
 * import-export-preference rule checks (using Oxlint for faster analysis).
 * This rule enforces consistent use of named exports vs default exports.
 *
 * - "named" variant: Reports violations when default exports are used instead of named exports
 * - "default" variant: Reports violations when named exports are used instead of default exports
 */
export const importExportPreferenceChecks: OxlintRuleCheck[] = [
  {
    ruleId: "import-export-preference",
    variant: "named",
    oxlintConfig: {
      rule: "import/no-default-export",
      config: ["error"],
      plugins: ["import"],
    },
  },
  {
    ruleId: "import-export-preference",
    variant: "default",
    oxlintConfig: {
      rule: "import/prefer-default-export",
      config: ["error", { target: "single" }],
      plugins: ["import"],
    },
  },
];
