export function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="border-border bg-background/50 overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-4 py-2">
        <div className="flex gap-1.5">
          <div className="bg-destructive/60 h-3 w-3 rounded-full" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-muted-foreground ml-2 font-mono text-xs">
          {label}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm">
        <code className="text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}
