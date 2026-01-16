import type { Stat } from "./types";

export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="bg-muted/30 border-border/50 flex items-center gap-3 rounded-lg border p-3">
      <div className="text-primary">{stat.icon}</div>
      <div>
        <p className="text-foreground text-lg font-bold">{stat.value}</p>
        <p className="text-muted-foreground text-xs">{stat.label}</p>
      </div>
    </div>
  );
}
