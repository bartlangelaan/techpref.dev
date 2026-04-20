import type { OxlintRuleCheck } from "./index";

/**
 * react-jsx-boolean-value rule checks.
 *
 * Checks whether boolean JSX props should use the explicit `={true}` form
 * or the shorthand form (prop name only).
 */
export const reactJsxBooleanValueChecks: OxlintRuleCheck[] = [
  {
    ruleId: "react-jsx-boolean-value",
    variant: "never",
    oxlintConfig: {
      rule: "react-js/jsx-boolean-value",
      config: ["error", "never"],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
  {
    ruleId: "react-jsx-boolean-value",
    variant: "always",
    oxlintConfig: {
      rule: "react-js/jsx-boolean-value",
      config: ["error", "always"],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
];
