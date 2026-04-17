import { BarChart3, FileCode, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getDestructureInSignatureData(): ComparisonData {
  const stats = getBasicStats<
    "never" | "always-in-signature" | "always-outside-signature"
  >("react-destructuring-assignment");

  const neverVerdicts = stats.verdicts.never ?? [];
  const inSignatureVerdicts = stats.verdicts["always-in-signature"] ?? [];
  const outsideSignatureVerdicts =
    stats.verdicts["always-outside-signature"] ?? [];
  const mixedVerdicts = stats.verdicts.mixed ?? [];

  const inSignatureRepos =
    stats.verdictRepositories["always-in-signature"] ?? [];
  const outsideSignatureRepos =
    stats.verdictRepositories["always-outside-signature"] ?? [];

  const destructuringVerdicts =
    inSignatureVerdicts.length + outsideSignatureVerdicts.length;

  const inSignaturePercent =
    destructuringVerdicts > 0
      ? Math.round(
          (inSignatureVerdicts.length / destructuringVerdicts) * 100,
        )
      : 0;
  const outsideSignaturePercent =
    destructuringVerdicts > 0
      ? Math.round(
          (outsideSignatureVerdicts.length / destructuringVerdicts) * 100,
        )
      : 0;

  const winningSide =
    inSignaturePercent >= outsideSignaturePercent ? "left" : "right";

  return {
    slug: "destructure-in-signature",
    winningSide,
    title: "Destructure in Signature vs Outside Signature",
    description:
      "When destructuring props, should it happen right in the function signature or inside the function body? Compare how top TypeScript projects split on this React styling question.",
    badgeText: "React Component Patterns",
    leftSide: {
      title: "Destructure in Signature",
      subtitle:
        "Pull out each prop directly in the function parameter list for a concise, declarative component header.",
      codeLabel: "Button.tsx (destructure in signature)",
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
        "All destructured props visible in the signature",
        "Inline defaults and renames alongside the types",
        "No extra statement at the top of the body",
        "Encouraged by common React style guides",
        "Self-documents the component's API",
        "Shorter component body",
      ],
      projects: inSignatureRepos.slice(0, 3).map((p) => ({
        ...p,
        description: "Destructures props in the signature",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${inSignaturePercent}%`,
          label: "of analyzed repos",
          verdicts: inSignatureVerdicts,
          verdictTitle: "Repositories Destructuring in the Signature",
          verdictDescription:
            "These repositories destructure their props directly in the component signature",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${inSignatureVerdicts.length}`,
          label: "repositories",
          verdicts: inSignatureVerdicts,
          verdictTitle: "Repositories Destructuring in the Signature",
          verdictDescription:
            "These repositories destructure their props directly in the component signature",
        },
      ],
    },
    rightSide: {
      title: "Destructure Outside Signature",
      subtitle:
        "Accept the props object and destructure it inside the body — handy when props are still used as a whole.",
      codeLabel: "Button.tsx (destructure in body)",
      code: `interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button(props: ButtonProps) {
  const { label, onClick, disabled } = props;
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}`,
      features: [
        "Keeps the full props object available for forwarding",
        "Cleaner signatures for components with many props",
        "Easier to add or remove destructured fields later",
        "Co-locates destructuring with any derived logic",
        "Friendlier to hooks that need the whole props object",
        "Simpler diffs when signatures would otherwise wrap",
      ],
      projects: outsideSignatureRepos.slice(0, 3).map((p) => ({
        ...p,
        description: "Destructures props inside the component body",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${outsideSignaturePercent}%`,
          label: "of analyzed repos",
          verdicts: outsideSignatureVerdicts,
          verdictTitle: "Repositories Destructuring Outside the Signature",
          verdictDescription:
            "These repositories destructure their props inside the component body",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${outsideSignatureVerdicts.length}`,
          label: "repositories",
          verdicts: outsideSignatureVerdicts,
          verdictTitle: "Repositories Destructuring Outside the Signature",
          verdictDescription:
            "These repositories destructure their props inside the component body",
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
        value: `${neverVerdicts.length}`,
        label: "don't destructure at all",
        verdicts: neverVerdicts,
        verdictTitle: "Repositories that Don't Destructure Props",
        verdictDescription:
          "These repositories consistently access props through the props object",
      },
      {
        icon: <Users className="size-6 " />,
        value: `${mixedVerdicts.length}`,
        label: "use mixed styles",
        verdicts: mixedVerdicts,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories have no clear preference for where they destructure props",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const destructureInSignatureData = getDestructureInSignatureData();
