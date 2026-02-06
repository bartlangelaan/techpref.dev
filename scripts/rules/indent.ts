import type { OxlintRuleCheck } from "./index";

/**
 * indent rule checks (using Oxlint with @stylistic/eslint-plugin).
 * This rule enforces consistent indentation style.
 *
 * - "2-space" variant: Reports violations when indentation is not 2 spaces
 * - "4-space" variant: Reports violations when indentation is not 4 spaces
 * - "tab" variant: Reports violations when indentation is not tabs
 */
export const indentChecks: OxlintRuleCheck[] = [
  {
    ruleId: "indent",
    variant: "2-space",
    oxlintConfig: {
      rule: "@stylistic/indent",
      config: ["error", 2],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
  {
    ruleId: "indent",
    variant: "4-space",
    oxlintConfig: {
      rule: "@stylistic/indent",
      config: ["error", 4],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
  {
    ruleId: "indent",
    variant: "tab",
    oxlintConfig: {
      rule: "@stylistic/indent",
      config: ["error", "tab"],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
];
