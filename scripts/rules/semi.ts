import type { OxlintRuleCheck } from "./index";

/**
 * semi rule checks (using Oxlint with @stylistic/eslint-plugin).
 * This rule enforces consistent use of semicolons.
 *
 * - "always" variant: Reports violations when semicolons are missing
 * - "never" variant: Reports violations when semicolons are present
 */
export const semiChecks: OxlintRuleCheck[] = [
  {
    ruleId: "semi",
    variant: "always",
    oxlintConfig: {
      rule: "@stylistic/semi",
      config: ["error", "always"],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
  {
    ruleId: "semi",
    variant: "never",
    oxlintConfig: {
      rule: "@stylistic/semi",
      config: ["error", "never"],
      plugins: [],
      jsPlugins: ["@stylistic/eslint-plugin"],
    },
  },
];
