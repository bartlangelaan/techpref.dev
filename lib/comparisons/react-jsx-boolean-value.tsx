import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getReactJsxBooleanValueData(): ComparisonData {
  const stats = getBasicStats<"never" | "always">("react-jsx-boolean-value");

  const neverVerdicts = stats.verdicts["never"] ?? [];
  const alwaysVerdicts = stats.verdicts["always"] ?? [];
  const mixedVerdicts = stats.verdicts.mixed ?? [];

  const definiteVerdicts = neverVerdicts.length + alwaysVerdicts.length;
  const neverPercent =
    definiteVerdicts > 0
      ? Math.round((neverVerdicts.length / definiteVerdicts) * 100)
      : 0;
  const alwaysPercent =
    definiteVerdicts > 0
      ? Math.round((alwaysVerdicts.length / definiteVerdicts) * 100)
      : 0;

  const winningSide = neverPercent >= alwaysPercent ? "left" : "right";

  return {
    slug: "react-jsx-boolean-value",
    winningSide,
    title: "JSX Boolean Shorthand vs Explicit ={true}",
    description:
      "Should boolean JSX props use the concise shorthand form or always include the explicit ={true} value? See how top TypeScript projects handle boolean prop notation.",
    badgeText: "React Component Patterns",
    leftSide: {
      title: "Shorthand Boolean",
      subtitle:
        "Omit the value for boolean props — just write the prop name to mean true.",
      codeLabel: "Dialog.tsx (shorthand boolean)",
      code: `interface DialogProps {
  open: boolean;
  closable?: boolean;
  modal?: boolean;
}

function Dialog({ open, closable, modal }: DialogProps) {
  return (
    <dialog open={open}>
      <Panel closable modal />
    </dialog>
  );
}`,
      features: [
        "Concise, less visual noise in JSX",
        "Mirrors HTML boolean attribute style",
        "Consistent with browser attribute syntax",
        "Widely adopted in React codebases",
        "Reduces repetition of ={true}",
        "Default behavior in React for boolean props",
      ],
      projects: (stats.verdictRepositories["never"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses shorthand boolean props",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${neverPercent}%`,
          label: "of analyzed repos",
          verdicts: neverVerdicts,
          verdictTitle: "Repositories Using Boolean Shorthand",
          verdictDescription:
            "These repositories omit ={true} for boolean JSX props",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${neverVerdicts.length}`,
          label: "repositories",
          verdicts: neverVerdicts,
          verdictTitle: "Repositories Using Boolean Shorthand",
          verdictDescription:
            "These repositories omit ={true} for boolean JSX props",
        },
      ],
    },
    rightSide: {
      title: "Explicit ={true}",
      subtitle:
        "Always write ={true} for boolean props to make the value explicit and consistent.",
      codeLabel: "Dialog.tsx (explicit boolean)",
      code: `interface DialogProps {
  open: boolean;
  closable?: boolean;
  modal?: boolean;
}

function Dialog({ open, closable, modal }: DialogProps) {
  return (
    <dialog open={open}>
      <Panel closable={true} modal={true} />
    </dialog>
  );
}`,
      features: [
        "Explicit value makes intent unmistakably clear",
        "Consistent with other prop assignments",
        "Easier to find/replace true with a variable",
        "Uniform style across boolean and non-boolean props",
        "Avoids confusion about the prop's presence vs value",
        "Simpler linting rules to enforce",
      ],
      projects: (stats.verdictRepositories["always"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses explicit ={true} for boolean props",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${alwaysPercent}%`,
          label: "of analyzed repos",
          verdicts: alwaysVerdicts,
          verdictTitle: "Repositories Using Explicit ={true}",
          verdictDescription:
            "These repositories always write ={true} for boolean JSX props",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${alwaysVerdicts.length}`,
          label: "repositories",
          verdicts: alwaysVerdicts,
          verdictTitle: "Repositories Using Explicit ={true}",
          verdictDescription:
            "These repositories always write ={true} for boolean JSX props",
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
          "These repositories use both shorthand and explicit ={true} boolean props without a clear preference",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const reactJsxBooleanValueData = getReactJsxBooleanValueData();
