import { funcStyleChecks } from "./func-style";
import { indentChecks } from "./indent";
import { semiChecks } from "./semi";

/**
 * Defines a single ESLint rule check variant.
 * Each rule can have multiple variants (e.g., func-style has "expression" and "declaration").
 */
export interface RuleCheck {
  /** ESLint rule ID (e.g., "func-style") */
  ruleId: string;
  /** Variant name (e.g., "expression" or "declaration") */
  variant: string;
  /** ESLint rule configuration to use */
  eslintConfig: Record<string, unknown>;
}

/**
 * All rule checks to run during analysis.
 */
export const allRuleChecks: RuleCheck[] = [
  ...funcStyleChecks,
  ...indentChecks,
  ...semiChecks,
];
