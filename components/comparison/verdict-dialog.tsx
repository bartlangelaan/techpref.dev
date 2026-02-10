"use client";

import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode,
  Star,
} from "lucide-react";
import { useState } from "react";
import type { RepoVerdict } from "@/lib/analysis-results";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ViolationSample } from "@/lib/types";

interface VerdictDialogProps {
  title: string;
  description: string;
  verdicts: RepoVerdict[];
  children: React.ReactNode;
}

function SamplesList({
  samples,
  repoUrl,
  commit,
}: {
  samples: ViolationSample[];
  repoUrl: string;
  commit: string;
}) {
  if (samples.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">
        No samples available
      </span>
    );
  }

  return (
    <ul className="space-y-1 text-xs">
      {samples.map((sample, i) => (
        <li key={i} className="font-mono">
          <a
            href={`${repoUrl}/blob/${commit}/${sample.file}#L${sample.line}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-foreground min-w-0 truncate">
              {sample.file}
            </span>
            <span className="shrink-0">:{sample.line}</span>
            <ExternalLink className="size-3  shrink-0 opacity-50" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function RepoVerdictCard({ verdict }: { verdict: RepoVerdict }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border-border hover:border-muted-foreground/50 cursor-pointer rounded-lg border p-3 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={verdict.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-foreground hover:text-primary flex items-center gap-1 truncate font-medium"
            >
              {verdict.repoFullName}
              <ExternalLink className="size-3  shrink-0" />
            </a>
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <Star className="size-3 " />
            {verdict.stars.toLocaleString()}
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          {expanded ? (
            <ChevronDown className="size-4 " />
          ) : (
            <ChevronRight className="size-4 " />
          )}
        </div>
      </div>

      <p className="text-muted-foreground mt-2 text-xs">{verdict.reason}</p>

      {expanded && (
        <div className="border-border mt-3 space-y-3 border-t pt-3">
          <div className="text-foreground flex items-center gap-1 text-xs font-medium">
            <FileCode className="size-3 " />
            ESLint Rule Violations
          </div>
          <div className="space-y-3">
            {verdict.variants.map((variant) => (
              <div key={variant.name} className="bg-muted/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-medium">
                    {variant.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {variant.count} violations
                  </Badge>
                </div>
                <div className="mt-2">
                  <SamplesList
                    samples={variant.samples}
                    repoUrl={verdict.repoUrl}
                    commit={verdict.analyzedCommit}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VerdictDialog({
  title,
  description,
  verdicts,
  children,
}: VerdictDialogProps) {
  // Sort by stars descending
  const sortedVerdicts = [...verdicts].sort((a, b) => b.stars - a.stars);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            {sortedVerdicts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No repositories found for this category.
              </p>
            ) : (
              sortedVerdicts.map((verdict) => (
                <RepoVerdictCard key={verdict.repoFullName} verdict={verdict} />
              ))
            )}
          </div>
        </div>
        <div className="text-muted-foreground border-border border-t pt-3 text-xs">
          Showing {sortedVerdicts.length} repositories sorted by stars
        </div>
      </DialogContent>
    </Dialog>
  );
}
