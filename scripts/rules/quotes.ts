import type { OxlintRuleCheck } from "./index";

/**
 * quotes rule checks (using Oxlint with @stylistic/eslint-plugin).
 * This rule enforces consistent quote style.
 *
 * - "double" variant: Reports violations when single quotes are used instead of double quotes
 * - "single" variant: Reports violations when double quotes are used instead of single quotes
 */
export const quotesChecks: OxlintRuleCheck[] = [
  {
    ruleId: "quotes",
    variant: "double",
    oxlintConfig: {
      rule: "@stylistic/quotes",
      config: ["error", "double"],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
  {
    ruleId: "quotes",
    variant: "single",
    oxlintConfig: {
      rule: "@stylistic/quotes",
      config: ["error", "single"],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
];
