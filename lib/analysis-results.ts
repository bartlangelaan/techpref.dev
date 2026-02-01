import { groupBy, isNotNil, sortBy } from "es-toolkit";
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

/** Get basic statistics */
export function getBasicStats<V extends string>(ruleId: string) {
  const data = getUnifiedData();
  const repos = data.repositories.filter((r) => r.analysis !== null);

  type PV = V | 'mixed';
const variants = Object.keys(repos[0].analysis!.checks[ruleId]) as (V)[];
  const possibleVerdicts = [...variants, 'mixed'] as PV[];

  const verdictRepositories = Object.fromEntries(possibleVerdicts.map((v) => [v, [] as { name: string; url: string; stars: number }[]])) as Record<PV, { name: string; url: string; stars: number }[]>;

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
        verdictRepositories[verdict].push({ name: repo.fullName, url: repoUrl, stars: repo.stars });
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
