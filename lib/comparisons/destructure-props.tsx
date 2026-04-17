import { BarChart3, FileCode, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getDestructurePropsData(): ComparisonData {
  const stats = getBasicStats<
    "never" | "always-in-signature" | "always-outside-signature"
  >("react-destructuring-assignment");

  const neverVerdicts = stats.verdicts.never ?? [];
  const inSignatureVerdicts = stats.verdicts["always-in-signature"] ?? [];
  const outsideSignatureVerdicts =
    stats.verdicts["always-outside-signature"] ?? [];
  const mixedVerdicts = stats.verdicts.mixed ?? [];

  const destructureVerdicts = [
    ...inSignatureVerdicts,
    ...outsideSignatureVerdicts,
  ];

  const destructureRepos = [
    ...(stats.verdictRepositories["always-in-signature"] ?? []),
    ...(stats.verdictRepositories["always-outside-signature"] ?? []),
  ];

  const definiteVerdicts = destructureVerdicts.length + neverVerdicts.length;
  const destructurePercent =
    definiteVerdicts > 0
      ? Math.round((destructureVerdicts.length / definiteVerdicts) * 100)
      : 0;
  const neverPercent =
    definiteVerdicts > 0
      ? Math.round((neverVerdicts.length / definiteVerdicts) * 100)
      : 0;

  const winningSide = destructurePercent >= neverPercent ? "left" : "right";

  return {
    slug: "destructure-props",
    winningSide,
    title: "Destructure Props vs Don't Destructure Props",
    description:
      "Should React components destructure their props or access them through the props object? Explore how top TypeScript projects handle component props.",
    badgeText: "React Component Patterns",
    leftSide: {
      title: "Team Destructure",
      subtitle:
        "Pull out the props you need up front for concise, readable component code.",
      codeLabel: "Button.tsx (destructured props)",
      code: `interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}`,
      features: [
        "Concise references without the `props.` prefix",
        "Makes used props visible at a glance",
        "Enables renaming and default values inline",
        "Plays nicely with TypeScript inference",
        "Less repetition inside JSX",
        "Encourages smaller, focused components",
      ],
      projects: destructureRepos.slice(0, 3).map((p) => ({
        ...p,
        description: "Destructures component props",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${destructurePercent}%`,
          label: "of analyzed repos",
          verdicts: destructureVerdicts,
          verdictTitle: "Repositories that Destructure Props",
          verdictDescription:
            "These repositories consistently destructure component props",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${destructureVerdicts.length}`,
          label: "repositories",
          verdicts: destructureVerdicts,
          verdictTitle: "Repositories that Destructure Props",
          verdictDescription:
            "These repositories consistently destructure component props",
        },
      ],
    },
    rightSide: {
      title: "Team Props Object",
      subtitle:
        "Keep everything on the props object to stay explicit about where each value comes from.",
      codeLabel: "Button.tsx (props object)",
      code: `interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button(props: ButtonProps) {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </button>
  );
}`,
      features: [
        "Explicit about which values come from props",
        "Easier to forward the full props object",
        "Avoids long destructuring patterns for many props",
        "Keeps the function signature short",
        "Simpler when adding new props over time",
        "Familiar to developers from class component days",
      ],
      projects: (stats.verdictRepositories.never ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Keeps the props object intact",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${neverPercent}%`,
          label: "of analyzed repos",
          verdicts: neverVerdicts,
          verdictTitle: "Repositories that Don't Destructure Props",
          verdictDescription:
            "These repositories consistently access props through the props object",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${neverVerdicts.length}`,
          label: "repositories",
          verdicts: neverVerdicts,
          verdictTitle: "Repositories that Don't Destructure Props",
          verdictDescription:
            "These repositories consistently access props through the props object",
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
        icon: <FileCode className="size-6 " />,
        value: `${destructureVerdicts.length}`,
        label: "destructure props",
        verdicts: destructureVerdicts,
        verdictTitle: "Repositories that Destructure Props",
        verdictDescription:
          "These repositories consistently destructure component props",
      },
      {
        icon: <Users className="size-6 " />,
        value: `${mixedVerdicts.length}`,
        label: "use mixed styles",
        verdicts: mixedVerdicts,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories have no clear preference between destructuring and accessing props directly",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const destructurePropsData = getDestructurePropsData();
