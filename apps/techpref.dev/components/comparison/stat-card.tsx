import type { Stat } from "./types";

export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-primary">{stat.icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground">{stat.value}</p>
        <p className="text-xs text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  );
}
