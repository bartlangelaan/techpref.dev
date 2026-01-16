import { Badge } from "@/components/ui/badge";
import { BarChart3, Check, FileCode, Star, Users, Zap } from "lucide-react";
import { CodeBlock } from "./code-block";
import { InfluencerCard } from "./influencer-card";
import { ProjectCard } from "./project-card";
import { StatCard } from "./stat-card";
import type { ComparisonSide } from "./types";

export function ComparisonCard({
  side,
  variant,
}: {
  side: ComparisonSide;
  variant: "left" | "right";
}) {
  return (
    <div className="flex flex-col h-full p-6 lg:p-8 rounded-2xl border border-border bg-card">
      <div className="mb-6">
        <Badge
          variant="outline"
          className="mb-3 text-primary border-primary/30 bg-primary/5"
        >
          {side.badge}
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">
          {side.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{side.subtitle}</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Code Example */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" />
            Code Example
          </h3>
          <CodeBlock code={side.code} label={side.codeLabel} />
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Key Benefits
          </h3>
          <ul className="space-y-2.5">
            {side.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {side.stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Popular Projects */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Popular Projects
          </h3>
          <div className="space-y-3">
            {side.projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </div>

        {/* Influencers */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Advocates
          </h3>
          <div className="space-y-3">
            {side.influencers.map((influencer, index) => (
              <InfluencerCard key={index} influencer={influencer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
