import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getConsistentGenericConstructorsData(): ComparisonData {
  const stats = getBasicStats<"constructor" | "type-annotation">(
    "consistent-generic-constructors",
  );

  const winningSide =
    stats.verdictPercentages.constructor >=
    stats.verdictPercentages["type-annotation"]
      ? "left"
      : "right";

  return {
    slug: "consistent-generic-constructors",
    winningSide,
    title: "Generic Constructors: Type vs Constructor Parameters",
    description:
      "Two ways to specify generic parameters for constructors in TypeScript. Explore whether generics belong on the type annotation or the constructor call.",
    badgeText: "TypeScript Styleguide",
    leftSide: {
      title: "Constructor Generics",
      subtitle:
        "Specifying generic parameters directly on the constructor call.",
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
      projects: stats.verdictRepositories.constructor.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses constructor generics",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.constructor}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.constructor,
          verdictTitle: "Repositories using Constructor Generics",
          verdictDescription:
            "These repositories specify generic parameters on constructor calls",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.constructor.length}`,
          label: "repositories",
          verdicts: stats.verdicts.constructor,
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
      projects: stats.verdictRepositories["type-annotation"]
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses type annotation generics",
        })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages["type-annotation"]}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts["type-annotation"],
          verdictTitle: "Repositories using Type Annotation Generics",
          verdictDescription:
            "These repositories specify generic parameters on type annotations",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts["type-annotation"].length}`,
          label: "repositories",
          verdicts: stats.verdicts["type-annotation"],
          verdictTitle: "Repositories using Type Annotation Generics",
          verdictDescription:
            "These repositories specify generic parameters on type annotations",
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
        verdictTitle: "Repositories with Mixed Generic Constructor Approaches",
        verdictDescription:
          "These repositories mix both constructor and type annotation generic styles",
      },
    ],
  };
}

export const consistentGenericConstructorsData =
  getConsistentGenericConstructorsData();
