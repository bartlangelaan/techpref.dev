import type { OxlintRuleCheck } from "./index";

/**
 * indent rule checks (using custom techpref ESLint plugin).
 * This rule enforces consistent indentation character style.
 *
 * Unlike @stylistic/indent, this rule only checks:
 * - That all indentation uses the expected character type (tabs or spaces)
 * - That space indentation is a multiple of the expected size
 *
 * It does NOT enforce specific indentation depth for each syntax construct.
 *
 * - "2-space" variant: Reports violations when indentation uses tabs or non-multiples of 2 spaces
 * - "4-space" variant: Reports violations when indentation uses tabs or non-multiples of 4 spaces
 * - "tab" variant: Reports violations when indentation uses spaces instead of tabs
 */
export const indentChecks: OxlintRuleCheck[] = [
  {
    ruleId: "indent",
    variant: "2-space",
    oxlintConfig: {
      rule: "techpref/indent",
      config: ["error", 2],
      plugins: [],
      jsPlugins: ["./eslint-plugins/indent.ts"],
    },
  },
  {
    ruleId: "indent",
    variant: "4-space",
    oxlintConfig: {
      rule: "techpref/indent",
      config: ["error", 4],
      plugins: [],
      jsPlugins: ["./eslint-plugins/indent.ts"],
    },
  },
  {
    ruleId: "indent",
    variant: "tab",
    oxlintConfig: {
      rule: "techpref/indent",
      config: ["error", "tab"],
      plugins: [],
      jsPlugins: ["./eslint-plugins/indent.ts"],
    },
  },
];
