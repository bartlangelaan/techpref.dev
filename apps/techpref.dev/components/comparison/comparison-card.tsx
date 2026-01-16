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
    <div className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 lg:p-8">
      <div className="mb-6">
        <Badge
          variant="outline"
          className="text-primary border-primary/30 bg-primary/5 mb-3"
        >
          {side.badge}
        </Badge>
        <h2 className="text-foreground mb-2 text-3xl font-bold text-balance">
          {side.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{side.subtitle}</p>
      </div>

      <div className="flex-1 space-y-8">
        {/* Code Example */}
        <div>
          <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <FileCode className="text-primary h-4 w-4" />
            Code Example
          </h3>
          <CodeBlock code={side.code} label={side.codeLabel} />
        </div>

        {/* Features */}
        <div>
          <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <Zap className="text-primary h-4 w-4" />
            Key Benefits
          </h3>
          <ul className="space-y-2.5">
            {side.features.map((feature, index) => (
              <li
                key={index}
                className="text-muted-foreground flex items-start gap-3 text-sm"
              >
                <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <BarChart3 className="text-primary h-4 w-4" />
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
          <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <Star className="text-primary h-4 w-4" />
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
          <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
            <Users className="text-primary h-4 w-4" />
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
