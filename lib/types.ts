import {
  outputJsonSync,
  pathExistsSync,
  readJsonSync,
  removeSync,
} from "fs-extra/esm";
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
  analyzedCommitDate: string;
  checks: {
    [ruleId: string]: {
      [variant: string]: VariantResult;
    };
  };
}

/**
 * Repository data including metadata and analysis results.
 */
export interface RepositoryData {
  fullName: string;
  cloneUrl: string;
  stars: number;
  description: string | null;
}

/**
 * Unified data structure for the repositories JSON file.
 */
export interface RepositoriesJSON {
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
 * Path to the failing analysis files directory.
 */
export const FAILING_DIR = join(process.cwd(), "data/analysis/failing");

/**
 * Path to the cloned repositories directory.
 */
export const REPOS_DIR = join(process.cwd(), "repos");

/**
 * Information about a failed analysis attempt.
 */
export interface FailingAnalysisInfo {
  failedCommit: string;
}

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

  try {
    return readJsonSync(filePath) as AnalysisResult;
  } catch {
    return null;
  }
}

/**
 * Save analysis data for a specific repository.
 */
export function saveAnalysis(fullName: string, analysis: AnalysisResult): void {
  const filePath = getAnalysisFilePath(fullName);
  outputJsonSync(filePath, analysis, { spaces: 2 });
}

/**
 * Get the full path to a repository's failing analysis file.
 */
export function getFailingFilePath(fullName: string): string {
  return join(FAILING_DIR, getAnalysisFileName(fullName));
}

/**
 * Load failing analysis info for a specific repository.
 * Returns null if the file doesn't exist.
 */
export function loadFailingInfo(fullName: string): FailingAnalysisInfo | null {
  const filePath = getFailingFilePath(fullName);
  if (!pathExistsSync(filePath)) {
    return null;
  }
  try {
    return readJsonSync(filePath) as FailingAnalysisInfo;
  } catch {
    return null;
  }
}

/**
 * Save failing analysis info for a specific repository.
 */
export function saveFailingInfo(
  fullName: string,
  info: FailingAnalysisInfo,
): void {
  const filePath = getFailingFilePath(fullName);
  outputJsonSync(filePath, info, { spaces: 2 });
}

/**
 * Remove failing analysis info for a specific repository.
 */
export function removeFailingInfo(fullName: string): void {
  const filePath = getFailingFilePath(fullName);
  removeSync(filePath);
}

/**
 * Load unified data from the JSON file.
 * Returns null if the file doesn't exist.
 */
export function loadData(): RepositoriesJSON | null {
  try {
    return readJsonSync(DATA_FILE) as RepositoriesJSON;
  } catch {
    return null;
  }
}

/**
 * Load unified data with analysis merged in from separate files.
 * This is used by the web app to get the full data structure.
 */
export function loadDataWithAnalysis() {
  const data = loadData();

  return (
    data && {
      ...data,
      repositories: data.repositories.map((repo) => ({
        ...repo,
        analysis: loadAnalysis(repo.fullName),
      })),
    }
  );
}

/**
 * Save unified data to the JSON file.
 */
export function saveData(data: RepositoriesJSON): void {
  outputJsonSync(DATA_FILE, data, { spaces: 2 });
  console.log(`Saved ${data.repositories.length} repositories to ${DATA_FILE}`);
}
