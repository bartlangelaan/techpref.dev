"use client";

import {
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { RepositoryData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RepositoryStatus =
  | "analyzed"
  | "needs-update"
  | "failing"
  | "pending";

export interface RepositoryWithStatus extends RepositoryData {
  status: RepositoryStatus;
  analyzedCommitDate?: Date;
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return stars.toString();
}

function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: RepositoryStatus }) {
  switch (status) {
    case "analyzed":
      return (
        <Badge
          variant="outline"
          className="border-green-500/30 bg-green-500/10 text-green-600"
        >
          <CheckCircle className="mr-1 size-3" />
          Analyzed
        </Badge>
      );
    case "needs-update":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600"
        >
          <RefreshCw className="mr-1 size-3" />
          Needs Update
        </Badge>
      );
    case "failing":
      return (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-600"
        >
          <XCircle className="mr-1 size-3" />
          Failing
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-yellow-500/30 bg-yellow-500/10 text-yellow-600"
        >
          <Clock className="mr-1 size-3" />
          Pending
        </Badge>
      );
  }
}

interface FilterToggleProps {
  status: RepositoryStatus;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterToggle({ status, count, active, onClick }: FilterToggleProps) {
  const config = {
    analyzed: {
      icon: CheckCircle,
      label: "analyzed",
      activeClass: "bg-green-500/10 border-green-500/30 text-green-600",
      iconClass: "text-green-600",
    },
    "needs-update": {
      icon: RefreshCw,
      label: "needs update",
      activeClass: "bg-blue-500/10 border-blue-500/30 text-blue-600",
      iconClass: "text-blue-600",
    },
    failing: {
      icon: XCircle,
      label: "failing",
      activeClass: "bg-red-500/10 border-red-500/30 text-red-600",
      iconClass: "text-red-600",
    },
    pending: {
      icon: Clock,
      label: "pending",
      activeClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
      iconClass: "text-yellow-600",
    },
  }[status];

  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-all",
        active
          ? config.activeClass
          : "border-border bg-card/50 text-muted-foreground hover:bg-card",
      )}
    >
      <Icon className={cn("size-4", active && config.iconClass)} />
      <span className="font-medium">{count}</span>
      <span>{config.label}</span>
    </button>
  );
}

export function RepositoryList({
  repositories,
}: {
  repositories: RepositoryWithStatus[];
}) {
  const [activeFilters, setActiveFilters] = useState<Set<RepositoryStatus>>(
    new Set(["analyzed", "needs-update", "failing", "pending"]),
  );

  const toggleFilter = (status: RepositoryStatus) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        // Don't allow deselecting all filters
        if (next.size > 1) {
          next.delete(status);
        }
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const counts = {
    analyzed: repositories.filter((r) => r.status === "analyzed").length,
    "needs-update": repositories.filter((r) => r.status === "needs-update")
      .length,
    failing: repositories.filter((r) => r.status === "failing").length,
    pending: repositories.filter((r) => r.status === "pending").length,
  };

  const filteredRepositories = repositories.filter((r) =>
    activeFilters.has(r.status),
  );

  return (
    <>
      {/* Filter toggles */}
      <div className="flex flex-wrap gap-2">
        <FilterToggle
          status="analyzed"
          count={counts.analyzed}
          active={activeFilters.has("analyzed")}
          onClick={() => toggleFilter("analyzed")}
        />
        <FilterToggle
          status="needs-update"
          count={counts["needs-update"]}
          active={activeFilters.has("needs-update")}
          onClick={() => toggleFilter("needs-update")}
        />
        <FilterToggle
          status="failing"
          count={counts.failing}
          active={activeFilters.has("failing")}
          onClick={() => toggleFilter("failing")}
        />
        <FilterToggle
          status="pending"
          count={counts.pending}
          active={activeFilters.has("pending")}
          onClick={() => toggleFilter("pending")}
        />
      </div>

      {/* Repository List */}
      <div className="space-y-3">
        {filteredRepositories.map((repo) => (
          <Link
            key={repo.fullName}
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            className="group border-border bg-card/50 hover:bg-card hover:border-primary/50 flex flex-col gap-3 rounded-lg border p-4 transition-all duration-300 sm:flex-row sm:items-center"
          >
            {/* Main content */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-foreground group-hover:text-primary font-semibold transition-colors">
                  {repo.fullName}
                </h2>
                <ExternalLink className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {repo.description && (
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {repo.description}
                </p>
              )}
            </div>

            {/* Right side info */}
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              {/* Analysis date */}
              {repo.analyzedCommitDate && (
                <span className="text-muted-foreground whitespace-nowrap text-xs">
                  {formatDate(repo.analyzedCommitDate)}
                </span>
              )}

              {/* Status badge */}
              <StatusBadge status={repo.status} />

              {/* Stars */}
              <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
                <Star className="size-4 fill-yellow-500/80 text-yellow-500/80" />
                <span className="font-medium">{formatStars(repo.stars)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Showing count */}
      <p className="text-muted-foreground text-center text-sm">
        Showing {filteredRepositories.length} of {repositories.length}{" "}
        repositories
      </p>
    </>
  );
}
