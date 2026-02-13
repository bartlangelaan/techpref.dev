import { ArrowRight, Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { allComparisons } from "@/lib/comparisons";

export const dynamic = "error";

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="border-border relative overflow-hidden border-b">
        <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 mb-4"
          >
            <Sparkles className="mr-1 size-3 " />
            JavaScript / TypeScript Styleguides
          </Badge>
          <h1 className="text-foreground mb-6 text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
            <ViewTransition name="site-title">
              <span>TechPref</span>
            </ViewTransition>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg/relaxed  text-pretty sm:text-xl">
            Explore the most debated coding style preferences with real-world
            data from popular open source projects.
          </p>
        </div>
      </div>

      {/* Comparisons Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl">
            Style Comparisons
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Click on a comparison to explore both sides of the debate with
            statistics, code examples, and expert opinions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allComparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/${comparison.slug}`}
              className="group border-border bg-card hover:border-primary/50 relative rounded-2xl border p-6 transition-all duration-300"
            >
              <div className="absolute top-4 right-4">
                <ArrowRight className="text-muted-foreground h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Code2 className="h-5 w-5" />
                </div>
                <ViewTransition name={`badge-${comparison.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-muted-foreground border-border text-xs"
                  >
                    {comparison.badgeText}
                  </Badge>
                </ViewTransition>
              </div>

              <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold transition-colors">
                <ViewTransition name={`title-${comparison.slug}`}>
                  <span>{comparison.title}</span>
                </ViewTransition>
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                <ViewTransition name={`description-${comparison.slug}`}>
                  <span>{comparison.description}</span>
                </ViewTransition>
              </p>

              {comparison.leftSide.stats?.[0] &&
                comparison.rightSide.stats?.[0] && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ViewTransition name={`stats-${comparison.slug}-left`}>
                        <span
                          className={`font-semibold ${comparison.winningSide === "left" ? "text-primary" : "text-foreground"}`}
                        >
                          {comparison.leftSide.stats[0].value}
                        </span>
                      </ViewTransition>
                      <span className="text-muted-foreground">
                        {comparison.leftSide.title
                          .replace("Team ", "")
                          .replace("Function ", "")}
                      </span>
                    </div>
                    <div className="bg-border h-4 w-px" />
                    <div className="flex items-center gap-2">
                      <ViewTransition name={`stats-${comparison.slug}-right`}>
                        <span
                          className={`font-semibold ${comparison.winningSide === "right" ? "text-primary" : "text-foreground"}`}
                        >
                          {comparison.rightSide.stats[0].value}
                        </span>
                      </ViewTransition>
                      <span className="text-muted-foreground">
                        {comparison.rightSide.title
                          .replace("Team ", "")
                          .replace("Arrow ", "")}
                      </span>
                    </div>
                  </div>
                )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-border border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-sm">
            Data sourced from analysis of top TypeScript repositories on GitHub.{" "}
            <Link href="/repositories" className="text-primary hover:underline">
              View all repositories
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
