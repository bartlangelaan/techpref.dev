import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
  analyzedVersion: string;
  analyzedCommit: string;
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
 * Path to the unified JSON file.
 */
const DATA_FILE = join(process.cwd(), "data/repositories.json");

/**
 * Path to the analysis files directory.
 */
export const ANALYSIS_DIR = join(process.cwd(), "data/analysis");

/**
 * Path to the cloned repositories directory.
 */
export const REPOS_DIR = join(process.cwd(), "repos");

/**
 * Convert a repository fullName to its analysis file name.
 */
export function getAnalysisFileName(fullName: string): string {
  return fullName.replace("/", "-") + ".json";
}

/**
 * Get the full path to a repository's analysis file.
 */
export function getAnalysisFilePath(fullName: string): string {
  return join(ANALYSIS_DIR, getAnalysisFileName(fullName));
}

/**
 * Load analysis data for a specific repository.
 * Returns null if the file doesn't exist.
 */
export function loadAnalysis(fullName: string): AnalysisResult | null {
  const filePath = getAnalysisFilePath(fullName);
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Save analysis data for a specific repository.
 */
export function saveAnalysis(fullName: string, analysis: AnalysisResult): void {
  const filePath = getAnalysisFilePath(fullName);
  writeFileSync(filePath, JSON.stringify(analysis, null, 2));
}

/**
 * Load unified data from the JSON file.
 * Returns null if the file doesn't exist.
 */
export function loadData(): UnifiedData | null {
  if (!existsSync(DATA_FILE)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Load unified data with analysis merged in from separate files.
 * This is used by the web app to get the full data structure.
 */
export function loadDataWithAnalysis(): UnifiedData | null {
  const data = loadData();
  if (!data) {
    return null;
  }

  // Load all analysis files into a map for efficient lookup
  const analysisMap = new Map<string, AnalysisResult>();
  if (existsSync(ANALYSIS_DIR)) {
    const files = readdirSync(ANALYSIS_DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const filePath = join(ANALYSIS_DIR, file);
      try {
        const analysis: AnalysisResult = JSON.parse(
          readFileSync(filePath, "utf-8"),
        );
        // Convert filename back to fullName: "owner-repo.json" -> "owner/repo"
        const fullName = file.slice(0, -5).replace("-", "/");
        analysisMap.set(fullName, analysis);
      } catch {
        // Skip invalid files
      }
    }
  }

  // Merge analysis into repositories
  for (const repo of data.repositories) {
    const analysis = analysisMap.get(repo.fullName);
    if (analysis) {
      repo.analysis = analysis;
    }
  }

  return data;
}

/**
 * Save unified data to the JSON file.
 */
export function saveData(data: UnifiedData): void {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Saved ${data.repositories.length} repositories to ${DATA_FILE}`);
}
