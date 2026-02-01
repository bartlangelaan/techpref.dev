import type { RuleCheck } from "./index";

/**
 * func-style rule checks.
 * This rule enforces either function expressions or function declarations.
 *
 * - "expression" variant: Reports violations when function declarations are used
 * - "declaration" variant: Reports violations when function expressions are used
 */
export const funcStyleChecks: RuleCheck[] = [
  {
    ruleId: "func-style",
    variant: "expression",
    eslintConfig: {
      "func-style": ["error", "expression"],
    },
  },
  {
    ruleId: "func-style",
    variant: "declaration",
    eslintConfig: {
      "func-style": ["error", "declaration"],
    },
  },
];
