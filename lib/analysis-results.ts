import { groupBy, isNotNil, sortBy, zipObject } from "es-toolkit";
import repositoriesData from "../data/repositories.json";
import type {
  AnalysisResult,
  RepositoryData,
  UnifiedData,
  VariantResult,
  ViolationSample,
} from "./types";

// Re-export types for convenience
export type {
  AnalysisResult,
  RepositoryData,
  UnifiedData,
  VariantResult,
  ViolationSample,
};

/**
 * Detailed verdict for a repository.
 */
export interface RepoVerdict {
  repoFullName: string;
  repoUrl: string;
  stars: number;
  verdict: string;
  reason: string;
  variants: {
    name: string;
    count: number;
    samples: ViolationSample[];
  }[];
}

/**
 * Get the raw unified data.
 */
export function getUnifiedData(): UnifiedData {
  return repositoriesData as UnifiedData;
}

/**
 * Helper to get violation count from a variant result.
 * Handles both old format (number) and new format (VariantResult).
 */
function getCount(value: number | VariantResult | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  return value.count;
}

/**
 * Helper to get samples from a variant result.
 */
function getSamples(
  value: number | VariantResult | undefined,
): ViolationSample[] {
  if (value === undefined) return [];
  if (typeof value === "number") return [];
  return value.samples || [];
}

/**
 * Get spaces vs tabs statistics with detailed verdicts.
 */
export function getSpacesVsTabsStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let spacesRepos = 0;
  let tabsRepos = 0;
  let mixedRepos = 0;

  const spacesProjects: { name: string; url: string }[] = [];
  const tabsProjects: { name: string; url: string }[] = [];

  const spacesVerdicts: RepoVerdict[] = [];
  const tabsVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const indent = repo.analysis!.checks["indent"];
    if (!indent) continue;

    const twoSpaceCount = getCount(indent["2-space"]);
    const fourSpaceCount = getCount(indent["4-space"]);
    const tabCount = getCount(indent["tab"]);

    const spacesViolations = Math.min(twoSpaceCount, fourSpaceCount);
    const repoUrl = `https://github.com/${repo.fullName}`;

    const variants = [
      {
        name: "2-space",
        count: twoSpaceCount,
        samples: getSamples(indent["2-space"]),
      },
      {
        name: "4-space",
        count: fourSpaceCount,
        samples: getSamples(indent["4-space"]),
      },
      { name: "tab", count: tabCount, samples: getSamples(indent["tab"]) },
    ];

    const baseVerdict: Omit<RepoVerdict, "verdict" | "reason"> = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
      variants,
    };

    if (spacesViolations === 0 && tabCount === 0) {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: "No violations for any style (no indented code found)",
      });
    } else if (spacesViolations < tabCount / 2) {
      spacesRepos++;
      spacesVerdicts.push({
        ...baseVerdict,
        verdict: "spaces",
        reason: `${spacesViolations} space violations vs ${tabCount} tab violations`,
      });
      if (spacesProjects.length < 5) {
        spacesProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (tabCount < spacesViolations / 2) {
      tabsRepos++;
      tabsVerdicts.push({
        ...baseVerdict,
        verdict: "tabs",
        reason: `${tabCount} tab violations vs ${spacesViolations} space violations`,
      });
      if (tabsProjects.length < 5) {
        tabsProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Violations are close: ${spacesViolations} space vs ${tabCount} tab`,
      });
    }
  }

  const totalRepos = spacesRepos + tabsRepos + mixedRepos;
  const definiteRepos = spacesRepos + tabsRepos;

  return {
    totalRepos,
    spacesRepos,
    tabsRepos,
    mixedRepos,
    spacesPercent:
      definiteRepos > 0 ? Math.round((spacesRepos / definiteRepos) * 100) : 0,
    tabsPercent:
      definiteRepos > 0 ? Math.round((tabsRepos / definiteRepos) * 100) : 0,
    spacesProjects,
    tabsProjects,
    spacesVerdicts,
    tabsVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get 2-space vs 4-space indent statistics with detailed verdicts.
 */
export function getIndentStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let twoSpaceRepos = 0;
  let fourSpaceRepos = 0;
  let tabRepos = 0;
  let mixedRepos = 0;

  const twoSpaceProjects: { name: string; url: string }[] = [];
  const fourSpaceProjects: { name: string; url: string }[] = [];

  const twoSpaceVerdicts: RepoVerdict[] = [];
  const fourSpaceVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const indent = repo.analysis!.checks["indent"];
    if (!indent) continue;

    const twoSpaceCount = getCount(indent["2-space"]);
    const fourSpaceCount = getCount(indent["4-space"]);
    const tabCount = getCount(indent["tab"]);

    const repoUrl = `https://github.com/${repo.fullName}`;

    const variants = [
      {
        name: "2-space",
        count: twoSpaceCount,
        samples: getSamples(indent["2-space"]),
      },
      {
        name: "4-space",
        count: fourSpaceCount,
        samples: getSamples(indent["4-space"]),
      },
      { name: "tab", count: tabCount, samples: getSamples(indent["tab"]) },
    ];

    const baseVerdict: Omit<RepoVerdict, "verdict" | "reason"> = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
      variants,
    };

    const minViolations = Math.min(twoSpaceCount, fourSpaceCount, tabCount);

    const styles = [
      { style: "2-space", violations: twoSpaceCount },
      { style: "4-space", violations: fourSpaceCount },
      { style: "tab", violations: tabCount },
    ].sort((a, b) => a.violations - b.violations);

    const isMixed =
      styles[0].violations > 0 &&
      styles[1].violations / styles[0].violations < 1.5;

    if (isMixed) {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: ${styles[0].style}=${styles[0].violations}, ${styles[1].style}=${styles[1].violations}`,
      });
    } else if (minViolations === twoSpaceCount) {
      twoSpaceRepos++;
      twoSpaceVerdicts.push({
        ...baseVerdict,
        verdict: "2-space",
        reason: `Fewest violations with 2-space: ${twoSpaceCount} vs 4-space: ${fourSpaceCount}`,
      });
      if (twoSpaceProjects.length < 5) {
        twoSpaceProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (minViolations === fourSpaceCount) {
      fourSpaceRepos++;
      fourSpaceVerdicts.push({
        ...baseVerdict,
        verdict: "4-space",
        reason: `Fewest violations with 4-space: ${fourSpaceCount} vs 2-space: ${twoSpaceCount}`,
      });
      if (fourSpaceProjects.length < 5) {
        fourSpaceProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      tabRepos++;
    }
  }

  const totalRepos = twoSpaceRepos + fourSpaceRepos + tabRepos + mixedRepos;
  const spacesOnly = twoSpaceRepos + fourSpaceRepos;

  return {
    totalRepos,
    twoSpaceRepos,
    fourSpaceRepos,
    tabRepos,
    mixedRepos,
    twoSpacePercent:
      spacesOnly > 0 ? Math.round((twoSpaceRepos / spacesOnly) * 100) : 0,
    fourSpacePercent:
      spacesOnly > 0 ? Math.round((fourSpaceRepos / spacesOnly) * 100) : 0,
    twoSpaceProjects,
    fourSpaceProjects,
    twoSpaceVerdicts,
    fourSpaceVerdicts,
    mixedVerdicts,
  };
}

/** Get basic statistics */
export function getBasicStats<V extends string>(ruleId: string) {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  type PV = V | 'mixed';
const variants = Object.keys(repos[0].analysis!.checks[ruleId]) as (V)[];
  const possibleVerdicts = [...variants, 'mixed'] as PV[];

  const verdictRepositories = Object.fromEntries(possibleVerdicts.map((v) => [v, [] as { name: string; url: string }[]])) as Record<PV, { name: string; url: string }[]>;

  const allVerdicts = repos
    .map<RepoVerdict | null>((repo) => {
      const rule = repo.analysis!.checks[ruleId];
      if (!rule) return null;

      const variants = Object.entries(rule).map(([name, result]) => ({
        name: name as V,
        count: getCount(result),
        samples: getSamples(result),
      }));

      const variantsByViolations = sortBy(variants, [(v) => v.count]);

      const verdict = variantsByViolations[0].count * 2 < variantsByViolations[1].count
        ? variantsByViolations[0].name
        : "mixed";
      
      
    const repoUrl = `https://github.com/${repo.fullName}`;
      
      if (verdictRepositories[verdict].length < 5) {
        verdictRepositories[verdict].push({ name: repo.fullName, url: repoUrl });
      }

      return {
        repoFullName: repo.fullName,
        repoUrl,
        stars: repo.stars,
        variants: variants,
        verdict,
        reason: `Violations: ${variants.map((v) => `${v.name}=${v.count}`).join(", ")}`,
      };
    })
    .filter(isNotNil);

  const verdicts: Record<PV, RepoVerdict[]> = groupBy(allVerdicts, (v) => v.verdict);
  for (const key of possibleVerdicts) {
    verdicts[key] ??= [];
  }

  const verdictPercentages: Record<V, string> = {} as Record<V, number>;
  const totalVerdicts = allVerdicts.length - verdicts.mixed.length;
  for (const key of variants) {
    verdictPercentages[key] = totalVerdicts > 0 ? Math.round((verdicts[key].length / totalVerdicts) * 100).toFixed(0) : '0';
  }
  


  return { allVerdicts, verdicts, verdictRepositories, verdictPercentages };
}

/**
 * Get function style statistics with detailed verdicts.
 */
export function getFuncStyleStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let declarationRepos = 0;
  let expressionRepos = 0;
  let mixedRepos = 0;

  const declarationProjects: { name: string; url: string }[] = [];
  const expressionProjects: { name: string; url: string }[] = [];

  const declarationVerdicts: RepoVerdict[] = [];
  const expressionVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const funcStyle = repo.analysis!.checks["func-style"];
    if (!funcStyle) continue;

    const expressionCount = getCount(funcStyle["expression"]);
    const declarationCount = getCount(funcStyle["declaration"]);

    const repoUrl = `https://github.com/${repo.fullName}`;

    const variants = [
      {
        name: "expression",
        count: expressionCount,
        samples: getSamples(funcStyle["expression"]),
      },
      {
        name: "declaration",
        count: declarationCount,
        samples: getSamples(funcStyle["declaration"]),
      },
    ];

    const baseVerdict: Omit<RepoVerdict, "verdict" | "reason"> = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
      variants,
    };

    if (expressionCount === 0 && declarationCount === 0) {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: "No function declarations or expressions found",
      });
    } else if (expressionCount > declarationCount * 2) {
      declarationRepos++;
      declarationVerdicts.push({
        ...baseVerdict,
        verdict: "declaration",
        reason: `${expressionCount} expression violations vs ${declarationCount} declaration violations`,
      });
      if (declarationProjects.length < 5) {
        declarationProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (declarationCount > expressionCount * 2) {
      expressionRepos++;
      expressionVerdicts.push({
        ...baseVerdict,
        verdict: "expression",
        reason: `${declarationCount} declaration violations vs ${expressionCount} expression violations`,
      });
      if (expressionProjects.length < 5) {
        expressionProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: expression=${expressionCount}, declaration=${declarationCount}`,
      });
    }
  }

  const totalRepos = declarationRepos + expressionRepos + mixedRepos;
  const definiteRepos = declarationRepos + expressionRepos;

  return {
    totalRepos,
    declarationRepos,
    expressionRepos,
    mixedRepos,
    declarationPercent:
      definiteRepos > 0
        ? Math.round((declarationRepos / definiteRepos) * 100)
        : 0,
    expressionPercent:
      definiteRepos > 0
        ? Math.round((expressionRepos / definiteRepos) * 100)
        : 0,
    declarationProjects,
    expressionProjects,
    declarationVerdicts,
    expressionVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get semicolon usage statistics with detailed verdicts.
 */
export function getSemicolonStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let semicolonRepos = 0;
  let noSemicolonRepos = 0;
  let mixedRepos = 0;

  const semicolonProjects: { name: string; url: string }[] = [];
  const noSemicolonProjects: { name: string; url: string }[] = [];

  const semicolonVerdicts: RepoVerdict[] = [];
  const noSemicolonVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const semi = repo.analysis!.checks["semi"];
    if (!semi) continue;

    const alwaysCount = getCount(semi["always"]);
    const neverCount = getCount(semi["never"]);

    const repoUrl = `https://github.com/${repo.fullName}`;

    const variants = [
      {
        name: "always",
        count: alwaysCount,
        samples: getSamples(semi["always"]),
      },
      { name: "never", count: neverCount, samples: getSamples(semi["never"]) },
    ];

    const baseVerdict: Omit<RepoVerdict, "verdict" | "reason"> = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
      variants,
    };

    if (alwaysCount === 0 && neverCount === 0) {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: "No semicolon-related code found",
      });
    } else if (neverCount > alwaysCount * 2) {
      semicolonRepos++;
      semicolonVerdicts.push({
        ...baseVerdict,
        verdict: "semicolons",
        reason: `${neverCount} 'never' violations (has semicolons) vs ${alwaysCount} 'always' violations`,
      });
      if (semicolonProjects.length < 5) {
        semicolonProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (alwaysCount > neverCount * 2) {
      noSemicolonRepos++;
      noSemicolonVerdicts.push({
        ...baseVerdict,
        verdict: "no-semicolons",
        reason: `${alwaysCount} 'always' violations (missing semicolons) vs ${neverCount} 'never' violations`,
      });
      if (noSemicolonProjects.length < 5) {
        noSemicolonProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: always=${alwaysCount}, never=${neverCount}`,
      });
    }
  }

  const totalRepos = semicolonRepos + noSemicolonRepos + mixedRepos;
  const definiteRepos = semicolonRepos + noSemicolonRepos;

  return {
    totalRepos,
    semicolonRepos,
    noSemicolonRepos,
    mixedRepos,
    semicolonPercent:
      definiteRepos > 0
        ? Math.round((semicolonRepos / definiteRepos) * 100)
        : 0,
    noSemicolonPercent:
      definiteRepos > 0
        ? Math.round((noSemicolonRepos / definiteRepos) * 100)
        : 0,
    semicolonProjects,
    noSemicolonProjects,
    semicolonVerdicts,
    noSemicolonVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get consistent-type-definitions statistics with detailed verdicts.
 */
export function getConsistentTypeDefinitionsStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let interfaceRepos = 0;
  let typeRepos = 0;
  let mixedRepos = 0;

  const interfaceProjects: { name: string; url: string }[] = [];
  const typeProjects: { name: string; url: string }[] = [];

  const interfaceVerdicts: RepoVerdict[] = [];
  const typeVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const typeDefinitions =
      repo.analysis!.checks["consistent-type-definitions"];
    if (!typeDefinitions) continue;

    const interfaceCount = getCount(typeDefinitions["interface"]);
    const typeCount = getCount(typeDefinitions["type"]);

    const repoUrl = `https://github.com/${repo.fullName}`;
    const baseVerdict = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
    };

    if (interfaceCount > typeCount * 2) {
      interfaceRepos++;
      interfaceVerdicts.push({
        ...baseVerdict,
        verdict: "interface",
        reason: `${interfaceCount} 'interface' violations (type keyword used) vs ${typeCount} 'type' violations`,
      });
      if (interfaceProjects.length < 5) {
        interfaceProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (typeCount > interfaceCount * 2) {
      typeRepos++;
      typeVerdicts.push({
        ...baseVerdict,
        verdict: "type",
        reason: `${typeCount} 'type' violations (interface keyword used) vs ${interfaceCount} 'interface' violations`,
      });
      if (typeProjects.length < 5) {
        typeProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: interface=${interfaceCount}, type=${typeCount}`,
      });
    }
  }

  const totalRepos = interfaceRepos + typeRepos + mixedRepos;
  const definiteRepos = interfaceRepos + typeRepos;

  return {
    totalRepos,
    interfaceRepos,
    typeRepos,
    mixedRepos,
    interfacePercent:
      definiteRepos > 0
        ? Math.round((interfaceRepos / definiteRepos) * 100)
        : 0,
    typePercent:
      definiteRepos > 0 ? Math.round((typeRepos / definiteRepos) * 100) : 0,
    interfaceProjects,
    typeProjects,
    interfaceVerdicts,
    typeVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get consistent-type-imports statistics with detailed verdicts.
 */
export function getConsistentTypeImportsStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let typeImportsRepos = 0;
  let noTypeImportsRepos = 0;
  let mixedRepos = 0;

  const typeImportsProjects: { name: string; url: string }[] = [];
  const noTypeImportsProjects: { name: string; url: string }[] = [];

  const typeImportsVerdicts: RepoVerdict[] = [];
  const noTypeImportsVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const typeImports = repo.analysis!.checks["consistent-type-imports"];
    if (!typeImports) continue;

    const typeImportsCount = getCount(typeImports["type-imports"]);
    const noTypeImportsCount = getCount(typeImports["no-type-imports"]);

    const repoUrl = `https://github.com/${repo.fullName}`;
    const baseVerdict = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
    };

    if (typeImportsCount > noTypeImportsCount * 2) {
      typeImportsRepos++;
      typeImportsVerdicts.push({
        ...baseVerdict,
        verdict: "type-imports",
        reason: `${typeImportsCount} 'type-imports' violations vs ${noTypeImportsCount} 'no-type-imports' violations`,
      });
      if (typeImportsProjects.length < 5) {
        typeImportsProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (noTypeImportsCount > typeImportsCount * 2) {
      noTypeImportsRepos++;
      noTypeImportsVerdicts.push({
        ...baseVerdict,
        verdict: "no-type-imports",
        reason: `${noTypeImportsCount} 'no-type-imports' violations vs ${typeImportsCount} 'type-imports' violations`,
      });
      if (noTypeImportsProjects.length < 5) {
        noTypeImportsProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: type-imports=${typeImportsCount}, no-type-imports=${noTypeImportsCount}`,
      });
    }
  }

  const totalRepos = typeImportsRepos + noTypeImportsRepos + mixedRepos;
  const definiteRepos = typeImportsRepos + noTypeImportsRepos;

  return {
    totalRepos,
    typeImportsRepos,
    noTypeImportsRepos,
    mixedRepos,
    typeImportsPercent:
      definiteRepos > 0
        ? Math.round((typeImportsRepos / definiteRepos) * 100)
        : 0,
    noTypeImportsPercent:
      definiteRepos > 0
        ? Math.round((noTypeImportsRepos / definiteRepos) * 100)
        : 0,
    typeImportsProjects,
    noTypeImportsProjects,
    typeImportsVerdicts,
    noTypeImportsVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get consistent-indexed-object-style statistics with detailed verdicts.
 */
export function getConsistentIndexedObjectStyleStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let recordRepos = 0;
  let indexSignatureRepos = 0;
  let mixedRepos = 0;

  const recordProjects: { name: string; url: string }[] = [];
  const indexSignatureProjects: { name: string; url: string }[] = [];

  const recordVerdicts: RepoVerdict[] = [];
  const indexSignatureVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const indexedObjectStyle =
      repo.analysis!.checks["consistent-indexed-object-style"];
    if (!indexedObjectStyle) continue;

    const recordCount = getCount(indexedObjectStyle["record"]);
    const indexSignatureCount = getCount(indexedObjectStyle["index-signature"]);

    const repoUrl = `https://github.com/${repo.fullName}`;
    const baseVerdict = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
    };

    if (recordCount > indexSignatureCount * 2) {
      recordRepos++;
      recordVerdicts.push({
        ...baseVerdict,
        verdict: "record",
        reason: `${recordCount} 'record' violations vs ${indexSignatureCount} 'index-signature' violations`,
      });
      if (recordProjects.length < 5) {
        recordProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (indexSignatureCount > recordCount * 2) {
      indexSignatureRepos++;
      indexSignatureVerdicts.push({
        ...baseVerdict,
        verdict: "index-signature",
        reason: `${indexSignatureCount} 'index-signature' violations vs ${recordCount} 'record' violations`,
      });
      if (indexSignatureProjects.length < 5) {
        indexSignatureProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: record=${recordCount}, index-signature=${indexSignatureCount}`,
      });
    }
  }

  const totalRepos = recordRepos + indexSignatureRepos + mixedRepos;
  const definiteRepos = recordRepos + indexSignatureRepos;

  return {
    totalRepos,
    recordRepos,
    indexSignatureRepos,
    mixedRepos,
    recordPercent:
      definiteRepos > 0 ? Math.round((recordRepos / definiteRepos) * 100) : 0,
    indexSignaturePercent:
      definiteRepos > 0
        ? Math.round((indexSignatureRepos / definiteRepos) * 100)
        : 0,
    recordProjects,
    indexSignatureProjects,
    recordVerdicts,
    indexSignatureVerdicts,
    mixedVerdicts,
  };
}

/**
 * Get consistent-generic-constructors statistics with detailed verdicts.
 */
export function getConsistentGenericConstructorsStats() {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  let constructorRepos = 0;
  let typeAnnotationRepos = 0;
  let mixedRepos = 0;

  const constructorProjects: { name: string; url: string }[] = [];
  const typeAnnotationProjects: { name: string; url: string }[] = [];

  const constructorVerdicts: RepoVerdict[] = [];
  const typeAnnotationVerdicts: RepoVerdict[] = [];
  const mixedVerdicts: RepoVerdict[] = [];

  for (const repo of repos) {
    const genericConstructors =
      repo.analysis!.checks["consistent-generic-constructors"];
    if (!genericConstructors) continue;

    const constructorCount = getCount(genericConstructors["constructor"]);
    const typeAnnotationCount = getCount(
      genericConstructors["type-annotation"],
    );

    const repoUrl = `https://github.com/${repo.fullName}`;
    const baseVerdict = {
      repoFullName: repo.fullName,
      repoUrl,
      stars: repo.stars,
    };

    if (constructorCount > typeAnnotationCount * 2) {
      constructorRepos++;
      constructorVerdicts.push({
        ...baseVerdict,
        verdict: "constructor",
        reason: `${constructorCount} 'constructor' violations vs ${typeAnnotationCount} 'type-annotation' violations`,
      });
      if (constructorProjects.length < 5) {
        constructorProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else if (typeAnnotationCount > constructorCount * 2) {
      typeAnnotationRepos++;
      typeAnnotationVerdicts.push({
        ...baseVerdict,
        verdict: "type-annotation",
        reason: `${typeAnnotationCount} 'type-annotation' violations vs ${constructorCount} 'constructor' violations`,
      });
      if (typeAnnotationProjects.length < 5) {
        typeAnnotationProjects.push({ name: repo.fullName, url: repoUrl });
      }
    } else {
      mixedRepos++;
      mixedVerdicts.push({
        ...baseVerdict,
        verdict: "mixed",
        reason: `Close violations: constructor=${constructorCount}, type-annotation=${typeAnnotationCount}`,
      });
    }
  }

  const totalRepos = constructorRepos + typeAnnotationRepos + mixedRepos;
  const definiteRepos = constructorRepos + typeAnnotationRepos;

  return {
    totalRepos,
    constructorRepos,
    typeAnnotationRepos,
    mixedRepos,
    constructorPercent:
      definiteRepos > 0
        ? Math.round((constructorRepos / definiteRepos) * 100)
        : 0,
    typeAnnotationPercent:
      definiteRepos > 0
        ? Math.round((typeAnnotationRepos / definiteRepos) * 100)
        : 0,
    constructorProjects,
    typeAnnotationProjects,
    constructorVerdicts,
    typeAnnotationVerdicts,
    mixedVerdicts,
  };
}
