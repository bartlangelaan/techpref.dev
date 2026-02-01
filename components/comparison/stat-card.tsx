"use client";

import type { Stat } from "./types";
import { VerdictDialog } from "./verdict-dialog";

export function StatCard({ stat }: { stat: Stat }) {
  const content = (
    <div className="bg-muted/30 border-border/50 flex items-center gap-3 rounded-lg border p-3">
      <div className="text-primary">{stat.icon}</div>
      <div>
        <p className="text-foreground text-lg font-bold">{stat.value}</p>
        <p className="text-muted-foreground text-xs">{stat.label}</p>
      </div>
    </div>
  );

  if (stat.verdicts && stat.verdicts.length > 0) {
    return (
      <VerdictDialog
        title={stat.verdictTitle || `${stat.value} ${stat.label}`}
        description={stat.verdictDescription || `Repositories in this category`}
        verdicts={stat.verdicts}
      >
        <button className="w-full cursor-pointer text-left transition-opacity hover:opacity-80">
          {content}
        </button>
      </VerdictDialog>
    );
  }

  return content;
}
