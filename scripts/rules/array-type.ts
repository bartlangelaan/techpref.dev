import type { OxlintRuleCheck } from "./index";

/**
 * array-type rule checks (using Oxlint for faster analysis).
 * This rule enforces a consistent way of writing array types.
 *
 * - "array" variant: Reports violations when generic Array<T> syntax is used
 * - "generic" variant: Reports violations when T[] syntax is used
 */
export const arrayTypeChecks: OxlintRuleCheck[] = [
  {
    ruleId: "array-type",
    variant: "array",
    oxlintConfig: {
      rule: "typescript/array-type",
      config: ["error", { default: "array" }],
      plugins: ["typescript"],
    },
  },
  {
    ruleId: "array-type",
    variant: "generic",
    oxlintConfig: {
      rule: "typescript/array-type",
      config: ["error", { default: "generic" }],
      plugins: ["typescript"],
    },
  },
];
