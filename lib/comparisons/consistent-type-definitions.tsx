import type { ComparisonData } from "@/components/comparison";
import { getConsistentTypeDefinitionsStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getConsistentTypeDefinitionsData(): ComparisonData {
  const stats = getConsistentTypeDefinitionsStats();

  return {
    slug: "consistent-type-definitions",
    title: "Interface vs Type for Object Definitions",
    description:
      "Two ways to define object types in TypeScript. Explore the differences between interfaces and type aliases for type definitions.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Interface",
      subtitle:
        "TypeScript's dedicated keyword for object contracts with structural subtyping support.",
      badge: "Structural",
      codeLabel: "example.ts (interface)",
      code: `interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin extends User {
  role: 'admin';
  permissions: string[];
}`,
      features: [
        "Designed specifically for object shapes",
        "Supports declaration merging",
        "Better for public APIs",
        "Clearer intent for object contracts",
        "Supports 'extends' inheritance",
        "Structural typing built-in",
      ],
      projects: stats.interfaceProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Prefers interfaces",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.interfacePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.interfaceVerdicts,
          verdictTitle: "Repositories using Interfaces",
          verdictDescription:
            "These repositories prefer interfaces for object type definitions",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.interfaceRepos}`,
          label: "repositories",
          verdicts: stats.interfaceVerdicts,
          verdictTitle: "Repositories using Interfaces",
          verdictDescription:
            "These repositories prefer interfaces for object type definitions",
        },
      ],
    },
    rightSide: {
      title: "Type Alias",
      subtitle:
        "Flexible type aliases that can represent any type, including objects, unions, and tuples.",
      badge: "Flexible",
      codeLabel: "example.ts (type)",
      code: `type User = {
  id: number;
  name: string;
  email: string;
};

type Admin = User & {
  role: 'admin';
  permissions: string[];
};`,
      features: [
        "Works with any type, not just objects",
        "Supports union and intersection types",
        "More flexible for complex types",
        "Consistent with other type definitions",
        "No declaration merging",
        "Modern alternative to interfaces",
      ],
      projects: stats.typeProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Prefers type aliases",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.typePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.typeVerdicts,
          verdictTitle: "Repositories using Type Aliases",
          verdictDescription:
            "These repositories prefer type aliases for type definitions",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.typeRepos}`,
          label: "repositories",
          verdicts: stats.typeVerdicts,
          verdictTitle: "Repositories using Type Aliases",
          verdictDescription:
            "These repositories prefer type aliases for type definitions",
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
        label: "use mixed definitions",
        verdicts: stats.mixedVerdicts,
        verdictTitle: "Repositories with Mixed Type Definitions",
        verdictDescription:
          "These repositories use both interfaces and type aliases without a clear preference",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Use interface for object contracts and public APIs. Use type for everything else. Many projects standardize on one for consistency—popular libraries often prefer type for flexibility.",
      tools: ["TypeScript ESLint", "@typescript-eslint/eslint-plugin"],
    },
  };
}

export const consistentTypeDefinitionsData = getConsistentTypeDefinitionsData();
