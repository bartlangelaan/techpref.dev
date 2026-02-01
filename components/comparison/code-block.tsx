function renderCodeWithWhitespace(code: string, showWhitespace: boolean) {
  if (!showWhitespace) {
    return code;
  }

  const lines = code.split("\n");
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let i = 0;

    // Process leading whitespace
    while (i < line.length && (line[i] === " " || line[i] === "\t")) {
      if (line[i] === " ") {
        parts.push(
          <span key={`${lineIndex}-${i}`} className="text-muted-foreground/40">
            ·
          </span>,
        );
      } else if (line[i] === "\t") {
        parts.push(
          <span key={`${lineIndex}-${i}`} className="text-muted-foreground/40">
            →{"   "}
          </span>,
        );
      }
      i++;
    }

    // Add the rest of the line as regular text
    if (i < line.length) {
      parts.push(line.slice(i));
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

export function CodeBlock({
  code,
  label,
  showWhitespace = false,
}: {
  code: string;
  label: string;
  showWhitespace?: boolean;
}) {
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
        <code className="text-foreground/90">
          {renderCodeWithWhitespace(code, showWhitespace)}
        </code>
      </pre>
    </div>
  );
}
