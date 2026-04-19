import type { OxlintRuleCheck } from "./index";

/**
 * react-function-component-definition rule checks.
 *
 * Checks whether React function components should be defined using
 * function declarations or arrow functions.
 */
export const reactFunctionComponentDefinitionChecks: OxlintRuleCheck[] = [
  {
    ruleId: "react-function-component-definition",
    variant: "function-declaration",
    oxlintConfig: {
      rule: "react-js/function-component-definition",
      config: [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "function-expression",
        },
      ],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
  {
    ruleId: "react-function-component-definition",
    variant: "arrow-function",
    oxlintConfig: {
      rule: "react-js/function-component-definition",
      config: [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
];
