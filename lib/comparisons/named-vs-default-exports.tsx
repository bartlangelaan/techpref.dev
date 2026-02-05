import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getNamedVsDefaultExportsData(): ComparisonData {
  const stats = getBasicStats<'named' | 'default'>('import-export-preference');

  const winningSide = stats.verdictPercentages.named >= stats.verdictPercentages.default ? 'left' : 'right';

  return {
    slug: "named-vs-default-exports",
    winningSide,
    title: "Named Exports vs Default Exports",
    description:
      "Debate: Should modules export one thing by default or require explicit naming? Analyze real-world patterns from top TypeScript projects.",
    badgeText: "JavaScript / TypeScript Module Patterns",
    leftSide: {
      title: "Team Named Exports",
      subtitle:
        "Explicit, discoverable, and enables better tree-shaking and tooling support.",
      codeLabel: "module.ts (named exports)",
      code: `export interface User {
  id: string;
  name: string;
}

export const createUser = (name: string): User => ({
  id: Math.random().toString(),
  name,
});

export const getUserById = (id: string): User | null => {
  // implementation
  return null;
};`,
      features: [
        "Explicit about what's being exported",
        "Better IDE autocompletion and intellisense",
        "Enables effective tree-shaking",
        "Prevents namespace pollution",
        "Easier refactoring with rename tools",
        "Scales well as modules grow",
      ],
      projects: stats.verdictRepositories.named.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses named exports",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.named}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.named,
          verdictTitle: "Repositories using Named Exports",
          verdictDescription:
            "These repositories consistently prefer named exports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.named.length}`,
          label: "repositories",
          verdicts: stats.verdicts.named,
          verdictTitle: "Repositories using Named Exports",
          verdictDescription:
            "These repositories consistently prefer named exports",
        },
      ],
    },
    rightSide: {
      title: "Team Default Exports",
      subtitle:
        "Simple, familiar, and provides a clear single entry point for a module.",
      codeLabel: "module.ts (default export)",
      code: `interface User {
  id: string;
  name: string;
}

const createUser = (name: string): User => ({
  id: Math.random().toString(),
  name,
});

const getUserById = (id: string): User | null => {
  // implementation
  return null;
};

export default {
  createUser,
  getUserById,
};`,
      features: [
        "Single, clear entry point",
        "Simpler for module wrapping",
        "Traditional CommonJS style",
        "Useful for main module behaviors",
        "Shorter import statements",
        "Familiar to JavaScript developers",
      ],
      projects: stats.verdictRepositories.default.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses default exports",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.default}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.default,
          verdictTitle: "Repositories using Default Exports",
          verdictDescription:
            "These repositories consistently prefer default exports",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.default.length}`,
          label: "repositories",
          verdicts: stats.verdicts.default,
          verdictTitle: "Repositories using Default Exports",
          verdictDescription:
            "These repositories consistently prefer default exports",
        },
      ],
    },
    bottomStats: [
      {
        icon: <BarChart3 className="h-6 w-6" />,
        value: `${stats.allVerdicts.length}`,
        label: "repositories analyzed",
      },
      {
        icon: <Users className="h-6 w-6" />,
        value: `${stats.verdicts.mixed.length}`,
        label: "use mixed styles",
        verdicts: stats.verdicts.mixed,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories use both named and default exports inconsistently",
      },
    ],
    conclusion: {
      title: "Best Practice?",
      description:
        "Most modern tooling and frameworks recommend named exports for better scalability and tree-shaking. However, default exports have their place for main module behaviors.",
      tools: ["ESLint", "TypeScript", "Rollup", "Webpack"],
    },
  };
}

// Keep backward compatibility with static export
export const namedVsDefaultExportsData = getNamedVsDefaultExportsData();
