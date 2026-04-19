import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getReactJsxFragmentsData(): ComparisonData {
  const stats = getBasicStats<"syntax" | "element">("react-jsx-fragments");

  const syntaxVerdicts = stats.verdicts["syntax"] ?? [];
  const elementVerdicts = stats.verdicts["element"] ?? [];
  const mixedVerdicts = stats.verdicts.mixed ?? [];

  const definiteVerdicts = syntaxVerdicts.length + elementVerdicts.length;
  const syntaxPercent =
    definiteVerdicts > 0
      ? Math.round((syntaxVerdicts.length / definiteVerdicts) * 100)
      : 0;
  const elementPercent =
    definiteVerdicts > 0
      ? Math.round((elementVerdicts.length / definiteVerdicts) * 100)
      : 0;

  const winningSide = syntaxPercent >= elementPercent ? "left" : "right";

  return {
    slug: "react-jsx-fragments",
    winningSide,
    title: "Fragment Shorthand <> vs React.Fragment",
    description:
      "Should React fragments use the concise JSX shorthand syntax <> or the explicit React.Fragment element? See how top TypeScript projects approach this common React styling choice.",
    badgeText: "React Component Patterns",
    leftSide: {
      title: "Fragment Shorthand",
      subtitle:
        "Use the compact <> shorthand for a clean, minimal fragment syntax.",
      codeLabel: "List.tsx (fragment shorthand)",
      code: `function List({ items }: { items: string[] }) {
  return (
    <>
      <h2>Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}`,
      features: [
        "Shorter, less visually noisy syntax",
        "No need to import React.Fragment explicitly",
        "Widely adopted in modern React codebases",
        "Reduces boilerplate in deeply nested JSX",
        "Consistent with modern JSX transform",
        "Encouraged by React documentation",
      ],
      projects: (stats.verdictRepositories["syntax"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses <> fragment shorthand",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${syntaxPercent}%`,
          label: "of analyzed repos",
          verdicts: syntaxVerdicts,
          verdictTitle: "Repositories Using Fragment Shorthand",
          verdictDescription:
            "These repositories use the <> shorthand syntax for React fragments",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${syntaxVerdicts.length}`,
          label: "repositories",
          verdicts: syntaxVerdicts,
          verdictTitle: "Repositories Using Fragment Shorthand",
          verdictDescription:
            "These repositories use the <> shorthand syntax for React fragments",
        },
      ],
    },
    rightSide: {
      title: "React.Fragment Element",
      subtitle:
        "Use the explicit React.Fragment element for fragments that may need a key or other props.",
      codeLabel: "List.tsx (React.Fragment element)",
      code: `function List({ items }: { items: string[] }) {
  return (
    <React.Fragment>
      <h2>Items</h2>
      <ul>
        {items.map((item) => (
          <React.Fragment key={item}>
            <li>{item}</li>
          </React.Fragment>
        ))}
      </ul>
    </React.Fragment>
  );
}`,
      features: [
        "Supports the key prop for keyed fragments",
        "Makes the fragment type explicit and searchable",
        "Clearer intent when fragments hold semantic meaning",
        "Consistent with other JSX element syntax",
        "Easier to add props later without refactoring",
        "More familiar to developers new to fragments",
      ],
      projects: (stats.verdictRepositories["element"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses React.Fragment element syntax",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${elementPercent}%`,
          label: "of analyzed repos",
          verdicts: elementVerdicts,
          verdictTitle: "Repositories Using React.Fragment",
          verdictDescription:
            "These repositories use the explicit React.Fragment element syntax",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${elementVerdicts.length}`,
          label: "repositories",
          verdicts: elementVerdicts,
          verdictTitle: "Repositories Using React.Fragment",
          verdictDescription:
            "These repositories use the explicit React.Fragment element syntax",
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
        value: `${mixedVerdicts.length}`,
        label: "use mixed styles",
        verdicts: mixedVerdicts,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories use both <> and React.Fragment without a clear preference",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const reactJsxFragmentsData = getReactJsxFragmentsData();
