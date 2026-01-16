import Link from "next/link";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { allComparisons } from "@/lib/comparisons";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
          <Badge
            variant="outline"
            className="mb-4 text-primary border-primary/30 bg-primary/5"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            JavaScript / TypeScript Styleguides
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            TechPref
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Explore the most debated coding style preferences with real-world
            data from popular open source projects.
          </p>
        </div>
      </div>

      {/* Comparisons Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Style Comparisons
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Click on a comparison to explore both sides of the debate with
            statistics, code examples, and expert opinions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allComparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/${comparison.slug}`}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="absolute top-4 right-4">
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-border"
                >
                  {comparison.badgeText}
                </Badge>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {comparison.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {comparison.description}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    {comparison.leftSide.stats[0]?.value}
                  </span>
                  <span className="text-muted-foreground">
                    {comparison.leftSide.title
                      .replace("Team ", "")
                      .replace("Function ", "")}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {comparison.rightSide.stats[0]?.value}
                  </span>
                  <span className="text-muted-foreground">
                    {comparison.rightSide.title
                      .replace("Team ", "")
                      .replace("Arrow ", "")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Data sourced from analysis of top TypeScript repositories on GitHub.
          </p>
        </div>
      </div>
    </main>
  );
}
