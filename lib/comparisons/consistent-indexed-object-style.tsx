import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getConsistentIndexedObjectStyleData(): ComparisonData {
  const stats = getBasicStats<'record' | 'index-signature'>('consistent-indexed-object-style');

  return {
    slug: "consistent-indexed-object-style",
    title: "Indexed Objects: Record<K, V> vs Index Signatures",
    description:
      "Two ways to define indexed object types in TypeScript. Explore the differences between Record<K, V> utility type and index signature syntax.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Record Utility Type",
      subtitle:
        "Using the Record<K, V> utility type to define indexed object properties.",
      badge: "Utility",
      codeLabel: "example.ts (Record<K, V>)",
      code: `type UserRoles = Record<'admin' | 'user' | 'guest', Role>;
type ConfigMap = Record<string, string | number>;

interface Config {
  settings: Record<string, unknown>;
  features: Record<FeatureName, boolean>;
}`,
      features: [
        "Concise and readable utility type",
        "Clear what keys and values are",
        "Works well with union key types",
        "Easy to understand intent",
        "Modern TypeScript approach",
        "Better for complex key types",
      ],
      projects: stats.verdictRepositories.record.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses Record<K, V>",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.record}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.record,
          verdictTitle: "Repositories using Record<K, V>",
          verdictDescription:
            "These repositories prefer the Record utility type for indexed objects",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.record.length}`,
          label: "repositories",
          verdicts: stats.verdicts.record,
          verdictTitle: "Repositories using Record<K, V>",
          verdictDescription:
            "These repositories prefer the Record utility type for indexed objects",
        },
      ],
    },
    rightSide: {
      title: "Index Signature",
      subtitle:
        "Using index signatures to define dynamically keyed object properties.",
      badge: "Traditional",
      codeLabel: "example.ts (index signature)",
      code: `interface UserRoles {
  [role: string]: Role;
}

type ConfigMap = {
  [key: string]: string | number;
};

interface Config {
  settings: { [key: string]: unknown };
  features: { [key: FeatureName]: boolean };
}`,
      features: [
        "Classic TypeScript syntax",
        "Explicitly shows dynamic keys",
        "More flexible in some contexts",
        "Works in interfaces and types",
        "Better for object-like structures",
        "Clearer when extending properties",
      ],
      projects: stats.verdictRepositories['index-signature'].slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses index signatures",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages['index-signature']}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts['index-signature'],
          verdictTitle: "Repositories using Index Signatures",
          verdictDescription:
            "These repositories prefer index signature syntax for indexed objects",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts['index-signature'].length}`,
          label: "repositories",
          verdicts: stats.verdicts['index-signature'],
          verdictTitle: "Repositories using Index Signatures",
          verdictDescription:
            "These repositories prefer index signature syntax for indexed objects",
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
        verdictTitle: "Repositories with Mixed Indexed Object Styles",
        verdictDescription:
          "These repositories use both Record<K, V> and index signatures without a clear preference",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Use Record<K, V> for modern TypeScript code—it's clearer and more explicit. Use index signatures when you need maximum flexibility or when defining interfaces that extend multiple properties.",
      tools: ["TypeScript ESLint", "@typescript-eslint/eslint-plugin"],
    },
  };
}

export const consistentIndexedObjectStyleData = getConsistentIndexedObjectStyleData();
