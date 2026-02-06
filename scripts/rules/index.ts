import { DummyRule, OxlintConfig } from "oxlint";
import { arrayTypeChecks } from "./array-type";
import { consistentGenericConstructorsChecks } from "./consistent-generic-constructors";
import { consistentIndexedObjectStyleChecks } from "./consistent-indexed-object-style";
import { consistentTypeDefinitionsChecks } from "./consistent-type-definitions";
import { consistentTypeImportsChecks } from "./consistent-type-imports";
import { funcStyleChecks } from "./func-style";
import { importExportPreferenceChecks } from "./import-export-preference";
import { indentChecks } from "./indent";
import { quotesChecks } from "./quotes";
import { semiChecks } from "./semi";

/**
 * Rule check that uses Oxlint for analysis.
 */
export interface OxlintRuleCheck {
  /** Rule ID (e.g., "func-style") */
  ruleId: string;
  /** Variant name (e.g., "expression" or "declaration") */
  variant: string;
  /** Oxlint rule configuration */
  oxlintConfig: {
    /** Rule name in Oxlint format (e.g., "eslint/func-style") */
    rule: string;
    /** Rule configuration array (e.g., ["error", "expression"]) */
    config: DummyRule;
    /** Native Oxlint plugins to enable (e.g., ["eslint", "typescript"]) */
    plugins: NonNullable<OxlintConfig["plugins"]>;
    /** JS plugins to load (e.g., ["@stylistic/eslint-plugin"]) */
    jsPlugins?: string[];
  };
}

/**
 * All rule checks to run during analysis.
 */
export const allRuleChecks: OxlintRuleCheck[] = [
  ...arrayTypeChecks,
  ...consistentGenericConstructorsChecks,
  ...consistentIndexedObjectStyleChecks,
  ...consistentTypeDefinitionsChecks,
  ...consistentTypeImportsChecks,
  ...funcStyleChecks,
  ...importExportPreferenceChecks,
  ...indentChecks,
  ...quotesChecks,
  ...semiChecks,
];
