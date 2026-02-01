import type { ComparisonData } from "@/components/comparison";
import { getConsistentGenericConstructorsStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getConsistentGenericConstructorsData(): ComparisonData {
  const stats = getConsistentGenericConstructorsStats();

  return {
    slug: "consistent-generic-constructors",
    title: "Generic Constructors: Type vs Constructor Parameters",
    description:
      "Two ways to specify generic parameters for constructors in TypeScript. Explore whether generics belong on the type annotation or the constructor call.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Constructor Generics",
      subtitle:
        "Specifying generic parameters directly on the constructor call.",
      badge: "Constructor",
      codeLabel: "example.ts (constructor generic)",
      code: `const map = new Map<string, number>();
const set = new Set<User>();
const promise = new Promise<Data>((resolve) => {
  resolve(data);
});

const regex = new RegExp<string>(/pattern/);`,
      features: [
        "Generics specified at call site",
        "Clear where type parameters come from",
        "Works naturally with constructors",
        "Explicit type inference point",
        "Commonly used in popular libraries",
        "More control over type resolution",
      ],
      projects: stats.constructorProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses constructor generics",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.constructorPercent}%`,
          label: "of analyzed repos",
          verdicts: stats.constructorVerdicts,
          verdictTitle: "Repositories using Constructor Generics",
          verdictDescription:
            "These repositories specify generic parameters on constructor calls",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.constructorRepos}`,
          label: "repositories",
          verdicts: stats.constructorVerdicts,
          verdictTitle: "Repositories using Constructor Generics",
          verdictDescription:
            "These repositories specify generic parameters on constructor calls",
        },
      ],
    },
    rightSide: {
      title: "Type Annotation Generics",
      subtitle:
        "Specifying generic parameters on the variable type annotation.",
      badge: "Type Annotation",
      codeLabel: "example.ts (type annotation generic)",
      code: `const map: Map<string, number> = new Map();
const set: Set<User> = new Set();
const promise: Promise<Data> = new Promise((resolve) => {
  resolve(data);
});

const regex: RegExp = new RegExp(/pattern/);`,
      features: [
        "Type declared separately from constructor",
        "Better for readability in some cases",
        "Separates type concerns",
        "Can rely on type inference",
        "More formal type annotation style",
        "Works well when type is on line above",
      ],
      projects: stats.typeAnnotationProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses type annotation generics",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.typeAnnotationPercent}%`,
          label: "of analyzed repos",
          verdicts: stats.typeAnnotationVerdicts,
          verdictTitle: "Repositories using Type Annotation Generics",
          verdictDescription:
            "These repositories specify generic parameters on type annotations",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.typeAnnotationRepos}`,
          label: "repositories",
          verdicts: stats.typeAnnotationVerdicts,
          verdictTitle: "Repositories using Type Annotation Generics",
          verdictDescription:
            "These repositories specify generic parameters on type annotations",
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
        verdictTitle: "Repositories with Mixed Generic Constructor Approaches",
        verdictDescription:
          "These repositories mix both constructor and type annotation generic styles",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Use constructor generics for consistency with how methods are called. Type annotations are useful when the constructor call is complex or when you want to separate type concerns from instantiation.",
      tools: ["TypeScript ESLint", "@typescript-eslint/eslint-plugin"],
    },
  };
}

export const consistentGenericConstructorsData = getConsistentGenericConstructorsData();
