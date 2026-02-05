import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getConsistentTypeDefinitionsData(): ComparisonData {
  const stats = getBasicStats<'interface' | 'type'>('consistent-type-definitions');

  const winningSide = stats.verdictPercentages.interface >= stats.verdictPercentages.type ? 'left' : 'right';

  return {
    slug: "consistent-type-definitions",
    winningSide,
    title: "Interface vs Type for Object Definitions",
    description:
      "Two ways to define object types in TypeScript. Explore the differences between interfaces and type aliases for type definitions.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Interface",
      subtitle:
        "TypeScript's dedicated keyword for object contracts with structural subtyping support.",
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
      projects: stats.verdictRepositories.interface.slice(0, 3).map((p) => ({
        ...p,
        description: "Prefers interfaces",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.interface}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.interface,
          verdictTitle: "Repositories using Interfaces",
          verdictDescription:
            "These repositories prefer interfaces for object type definitions",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.interface.length}`,
          label: "repositories",
          verdicts: stats.verdicts.interface,
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
      projects: stats.verdictRepositories.type.slice(0, 3).map((p) => ({
        ...p,
        description: "Prefers type aliases",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.type}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.type,
          verdictTitle: "Repositories using Type Aliases",
          verdictDescription:
            "These repositories prefer type aliases for type definitions",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.type.length}`,
          label: "repositories",
          verdicts: stats.verdicts.type,
          verdictTitle: "Repositories using Type Aliases",
          verdictDescription:
            "These repositories prefer type aliases for type definitions",
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
        label: "use mixed definitions",
        verdicts: stats.verdicts.mixed,
        verdictTitle: "Repositories with Mixed Type Definitions",
        verdictDescription:
          "These repositories use both interfaces and type aliases without a clear preference",
      },
    ],
  };
}

export const consistentTypeDefinitionsData = getConsistentTypeDefinitionsData();
