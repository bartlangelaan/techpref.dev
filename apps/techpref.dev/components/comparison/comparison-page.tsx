import { Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ComparisonCard } from "./comparison-card";
import type { ComparisonData } from "./types";

export function ComparisonPage({ data }: { data: ComparisonData }) {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-primary border-primary/30 bg-primary/5"
          >
            {data.badgeText}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            {data.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            {data.description}
          </p>

          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {data.leftSide.stats[0]?.value}
              </p>
              <p className="text-sm text-muted-foreground">
                Use {data.leftSide.title.replace("Team ", "")}
              </p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {data.rightSide.stats[0]?.value}
              </p>
              <p className="text-sm text-muted-foreground">
                Use {data.rightSide.title.replace("Team ", "")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <ComparisonCard side={data.leftSide} variant="left" />
          <ComparisonCard side={data.rightSide} variant="right" />
        </div>

        {/* Bottom Stats Section */}
        {data.bottomStats.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Additional Insights
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                More data points to help you make an informed decision for your
                team.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.bottomStats.map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-card text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 lg:mt-24 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl border border-border bg-card">
            <Minus className="h-8 w-8 text-primary mb-4 rotate-90" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              {data.conclusion.title}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {data.conclusion.description}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {data.conclusion.tools.map((tool, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
