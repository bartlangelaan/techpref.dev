import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getConsistentTypeImportsData(): ComparisonData {
  const stats = getBasicStats<"type-imports" | "no-type-imports">(
    "consistent-type-imports",
  );

  const winningSide =
    stats.verdictPercentages["type-imports"] >=
    stats.verdictPercentages["no-type-imports"]
      ? "left"
      : "right";

  return {
    slug: "consistent-type-imports",
    winningSide,
    title: "Type Imports: 'type' Keyword vs Mixed Imports",
    description:
      "Two approaches to importing types in TypeScript. Explore whether to use the 'type' keyword for type-only imports or mix them with value imports.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Type Imports",
      subtitle:
        "Explicitly mark type-only imports with the 'type' keyword for clarity and better tree-shaking.",
      codeLabel: "example.ts (with type keyword)",
      code: `import type { User, Config } from '@/types';
import type React from 'react';
import { useState } from 'react';

import type { Database } from '@/db';
import { getUser } from '@/db';

const user: User = { id: 1 };`,
      features: [
        "Explicitly marks type-only imports",
        "Improves tree-shaking and bundle size",
        "Clearer intent for developers",
        "Prevents circular dependencies",
        "Works well with isolatedModules",
        "Modern TypeScript best practice",
      ],
      projects: stats.verdictRepositories["type-imports"]
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses type imports",
        })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages["type-imports"]}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts["type-imports"],
          verdictTitle: "Repositories using Type Imports",
          verdictDescription:
            "These repositories explicitly mark type-only imports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts["type-imports"].length}`,
          label: "repositories",
          verdicts: stats.verdicts["type-imports"],
          verdictTitle: "Repositories using Type Imports",
          verdictDescription:
            "These repositories explicitly mark type-only imports",
        },
      ],
    },
    rightSide: {
      title: "Mixed Imports",
      subtitle:
        "Mix types and values in regular imports without explicit 'type' keyword.",
      codeLabel: "example.ts (mixed imports)",
      code: `import { User, Config, getUser } from '@/types';
import React, { useState } from 'react';

import { Database, getUser as fetchUser } from '@/db';

const user: User = { id: 1 };`,
      features: [
        "Simpler import statements",
        "No distinction between types and values",
        "TypeScript compiler handles separation",
        "Less verbose for small modules",
        "Traditional approach before TypeScript 4.5",
        "Works fine with most projects",
      ],
      projects: stats.verdictRepositories["no-type-imports"]
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Mixes types and values",
        })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages["no-type-imports"]}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts["no-type-imports"],
          verdictTitle: "Repositories with Mixed Imports",
          verdictDescription:
            "These repositories don't distinguish type-only imports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts["no-type-imports"].length}`,
          label: "repositories",
          verdicts: stats.verdicts["no-type-imports"],
          verdictTitle: "Repositories with Mixed Imports",
          verdictDescription:
            "These repositories don't distinguish type-only imports",
        },
      ],
    },
    bottomStats: [
      {
        icon: <BarChart3 className="size-6 " />,
        value: `${stats.allVerdicts.length}`,
        label: "repositories analyzed",
      },
      {
        icon: <Users className="size-6 " />,
        value: `${stats.verdicts.mixed.length}`,
        label: "use mixed approaches",
        verdicts: stats.verdicts.mixed,
        verdictTitle: "Repositories with Mixed Import Approaches",
        verdictDescription:
          "These repositories mix both type-specific and traditional import styles",
      },
    ],
  };
}

export const consistentTypeImportsData = getConsistentTypeImportsData();
