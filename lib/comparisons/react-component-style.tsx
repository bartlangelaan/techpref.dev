import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getReactComponentStyleData(): ComparisonData {
  const stats = getBasicStats<"function-declaration" | "arrow-function">(
    "react-function-component-definition",
  );

  const functionDeclarationVerdicts =
    stats.verdicts["function-declaration"] ?? [];
  const arrowFunctionVerdicts = stats.verdicts["arrow-function"] ?? [];
  const mixedVerdicts = stats.verdicts.mixed ?? [];

  const definiteVerdicts =
    functionDeclarationVerdicts.length + arrowFunctionVerdicts.length;
  const functionDeclarationPercent =
    definiteVerdicts > 0
      ? Math.round(
          (functionDeclarationVerdicts.length / definiteVerdicts) * 100,
        )
      : 0;
  const arrowFunctionPercent =
    definiteVerdicts > 0
      ? Math.round((arrowFunctionVerdicts.length / definiteVerdicts) * 100)
      : 0;

  const winningSide =
    functionDeclarationPercent >= arrowFunctionPercent ? "left" : "right";

  return {
    slug: "react-component-style",
    winningSide,
    title: "React Function Declarations vs Arrow Functions",
    description:
      "Should React components be defined with function declarations or arrow functions? Explore how top TypeScript projects structure their React components.",
    badgeText: "React Component Patterns",
    leftSide: {
      title: "Function Declarations",
      subtitle:
        "Define components with traditional function syntax for clear hoisting and readability.",
      codeLabel: "Button.tsx (function declaration)",
      code: `interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

export default Button;`,
      features: [
        "Components are hoisted within their scope",
        "More traditional and familiar syntax",
        "Clear function keyword indicates it's a component",
        "Named functions appear in React DevTools",
        "Stack traces show the function name",
        "Consistent with React documentation examples",
      ],
      projects: (stats.verdictRepositories["function-declaration"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses function declarations for React components",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${functionDeclarationPercent}%`,
          label: "of analyzed repos",
          verdicts: functionDeclarationVerdicts,
          verdictTitle: "Repositories Using Function Declarations",
          verdictDescription:
            "These repositories define React components with function declarations",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${functionDeclarationVerdicts.length}`,
          label: "repositories",
          verdicts: functionDeclarationVerdicts,
          verdictTitle: "Repositories Using Function Declarations",
          verdictDescription:
            "These repositories define React components with function declarations",
        },
      ],
    },
    rightSide: {
      title: "Arrow Functions",
      subtitle:
        "Modern, concise component definitions with const declarations and arrow syntax.",
      codeLabel: "Button.tsx (arrow function)",
      code: `interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

export default Button;`,
      features: [
        "Concise, modern syntax",
        "Lexical 'this' binding (though rarely needed in components)",
        "Const prevents accidental reassignment",
        "Consistent with other const declarations",
        "Popular in modern React codebases",
        "Works seamlessly with type inference",
      ],
      projects: (stats.verdictRepositories["arrow-function"] ?? [])
        .slice(0, 3)
        .map((p) => ({
          ...p,
          description: "Uses arrow functions for React components",
        })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${arrowFunctionPercent}%`,
          label: "of analyzed repos",
          verdicts: arrowFunctionVerdicts,
          verdictTitle: "Repositories Using Arrow Functions",
          verdictDescription:
            "These repositories define React components with arrow functions",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${arrowFunctionVerdicts.length}`,
          label: "repositories",
          verdicts: arrowFunctionVerdicts,
          verdictTitle: "Repositories Using Arrow Functions",
          verdictDescription:
            "These repositories define React components with arrow functions",
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
          "These repositories use both function declarations and arrow functions for components without a clear preference",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const reactComponentStyleData = getReactComponentStyleData();
