export function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">
          {label}
        </span>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code className="text-foreground/90">{code}</code>
      </pre>
    </div>
  )
}
