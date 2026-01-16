import Link from "next/link"
import { Star, ExternalLink } from "lucide-react"
import type { Project } from "./types"

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.url}
      target="_blank"
      className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <Star className="h-4 w-4 fill-yellow-500/80 text-yellow-500/80" />
        <span className="font-medium">{project.stars}</span>
      </div>
    </Link>
  )
}
