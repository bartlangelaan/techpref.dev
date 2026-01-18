import { funcStyleChecks } from "./func-style.js";
import { indentChecks } from "./indent.js";
import { semiChecks } from "./semi.js";

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
 * Result for a single repository analysis.
 */
export interface RepoAnalysisResult {
  repoFullName: string;
  analyzedAt: string;
  checks: {
    [ruleId: string]: {
      [variant: string]: number;
    };
  };
}

/**
 * Output file structure for analysis results.
 */
export interface AnalysisOutput {
  startedAt: string;
  results: RepoAnalysisResult[];
}

/**
 * All rule checks to run during analysis.
 */
export const allRuleChecks: RuleCheck[] = [
  ...funcStyleChecks,
  ...indentChecks,
  ...semiChecks,
];
