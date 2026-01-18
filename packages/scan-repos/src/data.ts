import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Analysis result for a single repository.
 */
export interface AnalysisResult {
  analyzedAt: string;
  checks: {
    [ruleId: string]: {
      [variant: string]: number;
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
 * Path to the unified JSON file in the app.
 */
const DATA_FILE = join(
  process.cwd(),
  "../..",
  "apps/techpref.dev/repositories.json",
);

/**
 * Path to the cloned repositories directory.
 */
export const REPOS_DIR = join(process.cwd(), "repos");

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
 * Save unified data to the JSON file.
 */
export function saveData(data: UnifiedData): void {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Saved ${data.repositories.length} repositories to ${DATA_FILE}`);
}
