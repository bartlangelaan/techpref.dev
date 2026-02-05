import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getArrayTypeData(): ComparisonData {
  const stats = getBasicStats<'array' | 'generic'>('array-type');

  const winningSide = stats.verdictPercentages.array >= stats.verdictPercentages.generic ? 'left' : 'right';

  return {
    slug: "array-type",
    winningSide,
    title: "Array Types: T[] vs Array<T>",
    description:
      "Two syntaxes for defining array types in TypeScript. Explore the differences between the simple bracket notation and the generic Array type.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Array Bracket Notation",
      subtitle: "The modern, concise way to define array types using T[] syntax.",
      codeLabel: "example.ts (T[] syntax)",
      code: `const numbers: number[] = [1, 2, 3];
const users: User[] = [];
const nested: string[][] = [];
const readonly: readonly string[] = [];
const union: (string | number)[] = [];`,
      features: [
        "Concise and readable syntax",
        "Widely used in modern TypeScript",
        "Works with readonly modifier",
        "Supports union types directly",
        "Commonly preferred in popular projects",
        "Less verbose than generic syntax",
      ],
      projects: stats.verdictRepositories.array.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses array bracket notation",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.array}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.array,
          verdictTitle: "Repositories using T[] Notation",
          verdictDescription:
            "These repositories prefer the array bracket notation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.array.length}`,
          label: "repositories",
          verdicts: stats.verdicts.array,
          verdictTitle: "Repositories using T[] Notation",
          verdictDescription:
            "These repositories prefer the array bracket notation",
        },
      ],
    },
    rightSide: {
      title: "Generic Array<T> Syntax",
      subtitle:
        "The formal, generic way to define array types using Array<T> syntax.",
      codeLabel: "example.ts (Array<T> syntax)",
      code: `const numbers: Array<number> = [1, 2, 3];
const users: Array<User> = [];
const nested: Array<Array<string>> = [];
const readonly: ReadonlyArray<string> = [];
const union: Array<string | number> = [];`,
      features: [
        "Explicit generic syntax",
        "Clear type parameter declaration",
        "Works with ReadonlyArray",
        "Consistent with other generics",
        "Familiar to developers from other languages",
        "More verbose but potentially clearer",
      ],
      projects: stats.verdictRepositories.generic.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses Array<T> syntax",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.generic}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.generic,
          verdictTitle: "Repositories using Array<T> Syntax",
          verdictDescription:
            "These repositories prefer the generic Array<T> syntax",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.generic.length}`,
          label: "repositories",
          verdicts: stats.verdicts.generic,
          verdictTitle: "Repositories using Array<T> Syntax",
          verdictDescription:
            "These repositories prefer the generic Array<T> syntax",
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
        verdictTitle: "Repositories with Mixed Array Type Syntax",
        verdictDescription:
          "These repositories use both T[] and Array<T> without a clear preference",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Most modern TypeScript projects use T[] for its brevity and readability. Array<T> is typically chosen for consistency with other generic syntax in formal or library contexts.",
      tools: ["TypeScript ESLint", "@typescript-eslint/eslint-plugin"],
    },
  };
}

export const arrayTypeData = getArrayTypeData();
