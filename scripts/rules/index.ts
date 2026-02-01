import { funcStyleChecks } from "./func-style";
import { indentChecks } from "./indent";
import { semiChecks } from "./semi";

/**
 * Base properties shared by all rule checks.
 */
interface RuleCheckBase {
  /** Rule ID (e.g., "func-style") */
  ruleId: string;
  /** Variant name (e.g., "expression" or "declaration") */
  variant: string;
}

/**
 * Rule check that uses ESLint for analysis.
 */
export interface EslintRuleCheck extends RuleCheckBase {
  /** ESLint rule configuration */
  eslintConfig: Record<string, unknown>;
  oxlintConfig?: never;
}

/**
 * Rule check that uses Oxlint for analysis (faster).
 */
export interface OxlintRuleCheck extends RuleCheckBase {
  /** Oxlint rule configuration */
  oxlintConfig: {
    /** Rule name in Oxlint format (e.g., "eslint/func-style") */
    rule: string;
    /** Rule configuration array (e.g., ["error", "expression"]) */
    config: [string, ...unknown[]];
  };
  eslintConfig?: never;
}

/**
 * A rule check uses either ESLint or Oxlint for analysis.
 */
export type RuleCheck = EslintRuleCheck | OxlintRuleCheck;

/**
 * All rule checks to run during analysis.
 */
export const allRuleChecks: RuleCheck[] = [
  ...funcStyleChecks,
  ...indentChecks,
  ...semiChecks,
];
