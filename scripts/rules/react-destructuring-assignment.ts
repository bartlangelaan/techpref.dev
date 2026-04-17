import type { OxlintRuleCheck } from "./index";

/**
 * react-destructuring-assignment rule checks.
 *
 * Uses the JS plugin version of eslint-plugin-react under the "react-js" alias,
 * since "react" is a reserved built-in plugin name in Oxlint.
 */
export const reactDestructuringAssignmentChecks: OxlintRuleCheck[] = [
  {
    ruleId: "react-destructuring-assignment",
    variant: "never",
    oxlintConfig: {
      rule: "react-js/destructuring-assignment",
      config: ["error", "never"],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
  {
    ruleId: "react-destructuring-assignment",
    variant: "always-in-signature",
    oxlintConfig: {
      rule: "react-js/destructuring-assignment",
      config: ["error", "always", { destructureInSignature: "always" }],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
  {
    ruleId: "react-destructuring-assignment",
    variant: "always-outside-signature",
    oxlintConfig: {
      rule: "react-js/destructuring-assignment",
      config: ["error", "always", { destructureInSignature: "ignore" }],
      plugins: [],
      jsPlugins: [{ name: "react-js", specifier: "eslint-plugin-react" }],
    },
  },
];
