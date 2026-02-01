import type { EslintRuleCheck } from "./index";

/**
 * semi rule checks (using ESLint - not available in Oxlint).
 * This rule enforces consistent use of semicolons.
 *
 * - "always" variant: Reports violations when semicolons are missing
 * - "never" variant: Reports violations when semicolons are present
 */
export const semiChecks: EslintRuleCheck[] = [
  {
    ruleId: "semi",
    variant: "always",
    eslintConfig: {
      semi: ["error", "always"],
    },
  },
  {
    ruleId: "semi",
    variant: "never",
    eslintConfig: {
      semi: ["error", "never"],
    },
  },
];
