import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import type { Project } from "./types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.url}
      target="_blank"
      className="group border-border bg-card/50 hover:bg-card hover:border-primary/50 flex items-start gap-4 rounded-lg border p-4 transition-all duration-300"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-foreground group-hover:text-primary font-semibold transition-colors">
            {project.name}
          </h4>
          <ExternalLink className="text-muted-foreground h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {project.description}
        </p>
      </div>
      <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
        <Star className="h-4 w-4 fill-yellow-500/80 text-yellow-500/80" />
        <span className="font-medium">{project.stars}</span>
      </div>
    </Link>
  );
}
