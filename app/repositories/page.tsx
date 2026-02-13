import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAnalyzedVersion } from "@/lib/analysis-version";
import { loadData, loadAnalysis, loadFailingInfo } from "@/lib/types";
import {
  RepositoryList,
  type RepositoryStatus,
  type RepositoryWithStatus,
} from "./repository-list";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Repositories",
  description:
    "Browse all analyzed TypeScript repositories and their analysis status.",
};

function getRepositoriesWithStatus(): RepositoryWithStatus[] {
  const data = loadData();
  if (!data) return [];

  const currentVersion = getAnalyzedVersion();

  return data.repositories.map((repo) => {
    const analysis = loadAnalysis(repo.fullName);
    const failingInfo = loadFailingInfo(repo.fullName);

    let status: RepositoryStatus;
    if (analysis) {
      if (analysis.analyzedVersion !== currentVersion) {
        status = "needs-update";
      } else {
        status = "analyzed";
      }
    } else if (failingInfo) {
      status = "failing";
    } else {
      status = "pending";
    }

    return {
      ...repo,
      status,
      analyzedCommitDate: analysis
        ? new Date(analysis.analyzedCommitDate)
        : undefined,
    };
  });
}

export default function RepositoriesPage() {
  const repositories = getRepositoriesWithStatus();

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to comparisons
          </Link>
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Repositories
          </h1>
          <p className="text-muted-foreground">
            Browse all {repositories.length} TypeScript repositories analyzed by
            TechPref.
          </p>
        </div>
      </div>

      {/* Repository List with Filters */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <RepositoryList repositories={repositories} />
      </div>

      {/* Footer */}
      <div className="border-border border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-sm">
            Data sourced from analysis of top TypeScript repositories on GitHub.
          </p>
        </div>
      </div>
    </main>
  );
}
