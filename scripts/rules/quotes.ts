import type { EslintRuleCheck } from "./index";

/**
 * quotes rule checks (using Oxlint for faster analysis).
 * This rule enforces consistent quote style.
 *
 * - "double" variant: Reports violations when single quotes are used instead of double quotes
 * - "single" variant: Reports violations when double quotes are used instead of single quotes
 */
export const quotesChecks: EslintRuleCheck[] = [
  {
    ruleId: "quotes",
    variant: "double",
    eslintConfig: {
      quotes: ["error", "double"],
    },
  },
  {
    ruleId: "quotes",
    variant: "single",
    eslintConfig: {
      quotes: ["error", "single"],
    },
  },
];
