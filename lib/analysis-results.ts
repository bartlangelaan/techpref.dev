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

  const verdictPercentages: Record<V, string> = {} as Record<V, string>;
  const totalVerdicts = allVerdicts.length - verdicts.mixed.length;
  for (const key of variants) {
    verdictPercentages[key] = totalVerdicts > 0 ? Math.round((verdicts[key].length / totalVerdicts) * 100).toFixed(0) : '0';
  }
  


  return { allVerdicts, verdicts, verdictRepositories, verdictPercentages };
}
