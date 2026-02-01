import type { RuleCheck } from "./index";

/**
 * indent rule checks.
 * This rule enforces consistent indentation style.
 *
 * - "2-space" variant: Reports violations when indentation is not 2 spaces
 * - "4-space" variant: Reports violations when indentation is not 4 spaces
 * - "tab" variant: Reports violations when indentation is not tabs
 */
export const indentChecks: RuleCheck[] = [
  {
    ruleId: "indent",
    variant: "2-space",
    eslintConfig: {
      indent: ["error", 2],
    },
  },
  {
    ruleId: "indent",
    variant: "4-space",
    eslintConfig: {
      indent: ["error", 4],
    },
  },
  {
    ruleId: "indent",
    variant: "tab",
    eslintConfig: {
      indent: ["error", "tab"],
    },
  },
];
