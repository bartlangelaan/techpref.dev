import type { OxlintRuleCheck } from "./index";

/**
 * func-style rule checks (using Oxlint for faster analysis).
 * This rule enforces either function expressions or function declarations.
 *
 * - "expression" variant: Reports violations when function declarations are used
 * - "declaration" variant: Reports violations when function expressions are used
 */
export const funcStyleChecks: OxlintRuleCheck[] = [
  {
    ruleId: "func-style",
    variant: "expression",
    oxlintConfig: {
      rule: "eslint/func-style",
      config: ["error", "expression"],
      plugins: ["eslint"],
    },
  },
  {
    ruleId: "func-style",
    variant: "declaration",
    oxlintConfig: {
      rule: "eslint/func-style",
      config: ["error", "declaration"],
      plugins: ["eslint"],
    },
  },
];
