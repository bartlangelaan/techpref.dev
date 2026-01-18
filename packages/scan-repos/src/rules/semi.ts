import type { RuleCheck } from "./index.js";

/**
 * semi rule checks.
 * This rule enforces consistent use of semicolons.
 *
 * - "always" variant: Reports violations when semicolons are missing
 * - "never" variant: Reports violations when semicolons are present
 */
export const semiChecks: RuleCheck[] = [
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
