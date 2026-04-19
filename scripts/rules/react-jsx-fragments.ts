import type { OxlintRuleCheck } from "./index";

/**
 * react-jsx-fragments rule checks.
 *
 * Checks whether React fragments should use the shorthand syntax (<>...</>)
 * or the explicit element syntax (<React.Fragment>...</React.Fragment>).
 */
export const reactJsxFragmentsChecks: OxlintRuleCheck[] = [
  {
    ruleId: "react-jsx-fragments",
    variant: "syntax",
    oxlintConfig: {
      rule: "react-js/jsx-fragments",
      config: ["error", "syntax"],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
  {
    ruleId: "react-jsx-fragments",
    variant: "element",
    oxlintConfig: {
      rule: "react-js/jsx-fragments",
      config: ["error", "element"],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
];
