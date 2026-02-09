"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import type { ComparisonData } from "./types";
import { ComparisonCard } from "./comparison-card";
import { VerdictDialog } from "./verdict-dialog";

export function ComparisonPage({ data }: { data: ComparisonData }) {
  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <ViewTransition name="back-link">
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to all comparisons
              </span>
            </ViewTransition>
          </Link>
          <Link href="/" className="text-foreground text-lg font-semibold">
            <ViewTransition name="site-title">
              <span>TechPref</span>
            </ViewTransition>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="border-border relative overflow-hidden border-b">
        <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-4">
            <ViewTransition name={`badge-${data.slug}`}>
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5"
              >
                {data.badgeText}
              </Badge>
            </ViewTransition>
          </div>
          <h1 className="text-foreground mb-4 text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
            <ViewTransition name={`title-${data.slug}`}>
              <span>{data.title}</span>
            </ViewTransition>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg/relaxed  text-pretty sm:text-xl">
            <ViewTransition name={`description-${data.slug}`}>
              <span>{data.description}</span>
            </ViewTransition>
          </p>

          {data.leftSide.stats?.[0] && data.rightSide.stats?.[0] && (
            <div className="mt-10">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <ViewTransition name={`stats-${data.slug}-left`}>
                    <p
                      className={`text-3xl font-bold ${data.winningSide === "left" ? "text-primary" : "text-foreground"}`}
                    >
                      {data.leftSide.stats[0].value}
                    </p>
                  </ViewTransition>
                  <p className="text-muted-foreground text-sm">
                    Use {data.leftSide.title.replace("Team ", "")}
                  </p>
                </div>
                <div className="bg-border h-12 w-px" />
                <div className="text-center">
                  <ViewTransition name={`stats-${data.slug}-right`}>
                    <p
                      className={`text-3xl font-bold ${data.winningSide === "right" ? "text-primary" : "text-foreground"}`}
                    >
                      {data.rightSide.stats[0].value}
                    </p>
                  </ViewTransition>
                  <p className="text-muted-foreground text-sm">
                    Use {data.rightSide.title.replace("Team ", "")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ComparisonCard side={data.leftSide} />
          <ComparisonCard side={data.rightSide} />
        </div>

        {/* Bottom Stats Section */}
        {data.bottomStats && data.bottomStats.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="mb-10 text-center">
              <h2 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl">
                Additional Insights
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl">
                More data points to help you make an informed decision for your
                team.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {data.bottomStats.map((stat, index) => {
                const content = (
                  <div className="border-border bg-card rounded-xl border p-6 text-center">
                    <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
                      {stat.icon}
                    </div>
                    <p className="text-foreground mb-1 text-3xl font-bold">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {stat.label}
                    </p>
                  </div>
                );

                if (stat.verdicts && stat.verdicts.length > 0) {
                  return (
                    <VerdictDialog
                      key={index}
                      title={stat.verdictTitle || `${stat.value} ${stat.label}`}
                      description={
                        stat.verdictDescription ||
                        "Repositories in this category"
                      }
                      verdicts={stat.verdicts}
                    >
                      <button className="w-full cursor-pointer transition-opacity hover:opacity-80 sm:w-64">
                        {content}
                      </button>
                    </VerdictDialog>
                  );
                }

                return (
                  <div key={index} className="w-full sm:w-64">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
