"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RepoVerdict, ViolationSample } from "@/lib/analysis-results";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode,
  Star,
} from "lucide-react";
import { useState } from "react";

interface VerdictDialogProps {
  title: string;
  description: string;
  verdicts: RepoVerdict[];
  children: React.ReactNode;
}

function SamplesList({ samples }: { samples: ViolationSample[] }) {
  if (samples.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">
        No samples available
      </span>
    );
  }

  return (
    <ul className="space-y-1 text-xs">
      {samples.slice(0, 5).map((sample, i) => (
        <li key={i} className="text-muted-foreground font-mono">
          <span className="text-foreground">{sample.file}</span>
          <span className="text-muted-foreground">:{sample.line}</span>
        </li>
      ))}
      {samples.length > 5 && (
        <li className="text-muted-foreground">
          ...and {samples.length - 5} more
        </li>
      )}
    </ul>
  );
}

function RepoVerdictCard({ verdict }: { verdict: RepoVerdict }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-border rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={verdict.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary flex items-center gap-1 truncate font-medium"
            >
              {verdict.repoFullName}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <Star className="h-3 w-3" />
            {verdict.stars.toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Details
        </button>
      </div>

      <p className="text-muted-foreground mt-2 text-xs">{verdict.reason}</p>

      {expanded && (
        <div className="border-border mt-3 space-y-3 border-t pt-3">
          <div className="text-foreground flex items-center gap-1 text-xs font-medium">
            <FileCode className="h-3 w-3" />
            ESLint Rule Violations
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
                  <SamplesList samples={variant.samples} />
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
