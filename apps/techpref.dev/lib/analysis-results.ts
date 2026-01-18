import repositoriesData from "../repositories.json";

/**
 * A sample violation from a specific file.
 */
export interface ViolationSample {
  file: string;
  line: number;
  column: number;
  message: string;
}

/**
 * Detailed check result for a variant.
 */
export interface VariantResult {
  count: number;
  samples: ViolationSample[];
}

/**
 * Analysis result for a single repository.
 */
export interface AnalysisResult {
  analyzedAt: string;
  checks: {
    [ruleId: string]: {
      [variant: string]: VariantResult;
    };
  };
}

/**
 * Repository data including metadata, clone status, and analysis results.
 */
export interface RepositoryData {
  fullName: string;
  cloneUrl: string;
  stars: number;
  description: string | null;
  clonedAt: string | null;
  analysis: AnalysisResult | null;
}

/**
 * Unified data structure for the repositories JSON file.
 */
export interface UnifiedData {
  fetchedAt: string;
  repositories: RepositoryData[];
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
function getSamples(value: number | VariantResult | undefined): ViolationSample[] {
  if (value === undefined) return [];
  if (typeof value === "number") return [];
  return value.samples || [];
}

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
      { name: "2-space", count: twoSpaceCount, samples: getSamples(indent["2-space"]) },
      { name: "4-space", count: fourSpaceCount, samples: getSamples(indent["4-space"]) },
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
    spacesPercent: definiteRepos > 0 ? Math.round((spacesRepos / definiteRepos) * 100) : 0,
    tabsPercent: definiteRepos > 0 ? Math.round((tabsRepos / definiteRepos) * 100) : 0,
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
      { name: "2-space", count: twoSpaceCount, samples: getSamples(indent["2-space"]) },
      { name: "4-space", count: fourSpaceCount, samples: getSamples(indent["4-space"]) },
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
    twoSpacePercent: spacesOnly > 0 ? Math.round((twoSpaceRepos / spacesOnly) * 100) : 0,
    fourSpacePercent: spacesOnly > 0 ? Math.round((fourSpaceRepos / spacesOnly) * 100) : 0,
    twoSpaceProjects,
    fourSpaceProjects,
    twoSpaceVerdicts,
    fourSpaceVerdicts,
    mixedVerdicts,
  };
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
      { name: "expression", count: expressionCount, samples: getSamples(funcStyle["expression"]) },
      { name: "declaration", count: declarationCount, samples: getSamples(funcStyle["declaration"]) },
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
    declarationPercent: definiteRepos > 0 ? Math.round((declarationRepos / definiteRepos) * 100) : 0,
    expressionPercent: definiteRepos > 0 ? Math.round((expressionRepos / definiteRepos) * 100) : 0,
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
      { name: "always", count: alwaysCount, samples: getSamples(semi["always"]) },
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
    semicolonPercent: definiteRepos > 0 ? Math.round((semicolonRepos / definiteRepos) * 100) : 0,
    noSemicolonPercent: definiteRepos > 0 ? Math.round((noSemicolonRepos / definiteRepos) * 100) : 0,
    semicolonProjects,
    noSemicolonProjects,
    semicolonVerdicts,
    noSemicolonVerdicts,
    mixedVerdicts,
  };
}
