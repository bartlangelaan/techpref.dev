import type { ComparisonData } from "@/components/comparison";
import { getConsistentTypeImportsStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getConsistentTypeImportsData(): ComparisonData {
  const stats = getConsistentTypeImportsStats();

  return {
    slug: "consistent-type-imports",
    title: "Type Imports: 'type' Keyword vs Mixed Imports",
    description:
      "Two approaches to importing types in TypeScript. Explore whether to use the 'type' keyword for type-only imports or mix them with value imports.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Type Imports",
      subtitle:
        "Explicitly mark type-only imports with the 'type' keyword for clarity and better tree-shaking.",
      badge: "Explicit",
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
      projects: stats.typeImportsProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses type imports",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.typeImportsPercent}%`,
          label: "of analyzed repos",
          verdicts: stats.typeImportsVerdicts,
          verdictTitle: "Repositories using Type Imports",
          verdictDescription:
            "These repositories explicitly mark type-only imports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.typeImportsRepos}`,
          label: "repositories",
          verdicts: stats.typeImportsVerdicts,
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
      badge: "Traditional",
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
      projects: stats.noTypeImportsProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Mixes types and values",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.noTypeImportsPercent}%`,
          label: "of analyzed repos",
          verdicts: stats.noTypeImportsVerdicts,
          verdictTitle: "Repositories with Mixed Imports",
          verdictDescription:
            "These repositories don't distinguish type-only imports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.noTypeImportsRepos}`,
          label: "repositories",
          verdicts: stats.noTypeImportsVerdicts,
          verdictTitle: "Repositories with Mixed Imports",
          verdictDescription:
            "These repositories don't distinguish type-only imports",
        },
      ],
    },
    bottomStats: [
      {
        icon: <BarChart3 className="h-6 w-6" />,
        value: `${stats.totalRepos}`,
        label: "repositories analyzed",
      },
      {
        icon: <Users className="h-6 w-6" />,
        value: `${stats.mixedRepos}`,
        label: "use mixed approaches",
        verdicts: stats.mixedVerdicts,
        verdictTitle: "Repositories with Mixed Import Approaches",
        verdictDescription:
          "These repositories mix both type-specific and traditional import styles",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Use explicit 'type' imports for better tree-shaking and clarity, especially in modern projects. Most large projects are moving toward this pattern for better bundle optimization.",
      tools: ["TypeScript ESLint", "@typescript-eslint/eslint-plugin", "Vite"],
    },
  };
}

export const consistentTypeImportsData = getConsistentTypeImportsData();
