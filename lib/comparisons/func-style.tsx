import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getFuncStyleData(): ComparisonData {
  const stats = getBasicStats<"declaration" | "expression">("func-style");

  const winningSide =
    stats.verdictPercentages.declaration >= stats.verdictPercentages.expression
      ? "left"
      : "right";

  return {
    slug: "func-style",
    winningSide,
    title: "Function Declarations vs Arrow Functions",
    description:
      "Two ways to define functions in JavaScript. Explore the tradeoffs between traditional function declarations and modern arrow functions.",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "Function Declarations",
      subtitle:
        "Traditional, hoisted, and with their own 'this' binding. The classic way to define functions.",
      codeLabel: "example.js (function declaration)",
      code: `function calculateTotal(items) {
  return items.reduce(function(sum, item) {
    return sum + item.price;
  }, 0);
}

function handleClick() {
  console.log(this.name);
}`,
      features: [
        "Hoisted to the top of their scope",
        "Has its own 'this' binding",
        "Can be used as constructors with 'new'",
        "Named functions appear in stack traces",
        "More explicit and readable for some developers",
        "Required for generator functions",
      ],
      projects: stats.verdictRepositories.declaration.slice(0, 3).map((p) => ({
        ...p,
        description: "Prefers function declarations",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${stats.verdictPercentages.declaration}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.declaration,
          verdictTitle: "Repositories using Function Declarations",
          verdictDescription:
            "These repositories prefer function declarations over arrow functions",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${stats.verdicts.declaration.length}`,
          label: "repositories",
          verdicts: stats.verdicts.declaration,
          verdictTitle: "Repositories using Function Declarations",
          verdictDescription:
            "These repositories prefer function declarations over arrow functions",
        },
      ],
    },
    rightSide: {
      title: "Arrow Functions",
      subtitle:
        "Concise, lexically-scoped 'this', and perfect for callbacks and functional programming.",
      codeLabel: "example.js (arrow functions)",
      code: `const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price, 0);

const handleClick = () => {
  console.log(this.name);
};`,
      features: [
        "Concise syntax, especially for one-liners",
        "Lexical 'this' binding (inherits from parent)",
        "Perfect for callbacks and array methods",
        "No 'arguments' object (use rest parameters)",
        "Cannot be used as constructors",
        "Ideal for functional programming patterns",
      ],
      projects: stats.verdictRepositories.expression.slice(0, 3).map((p) => ({
        ...p,
        description: "Prefers arrow functions",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${stats.verdictPercentages.expression}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.expression,
          verdictTitle: "Repositories using Arrow Functions",
          verdictDescription:
            "These repositories prefer arrow functions/expressions over declarations",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${stats.verdicts.expression.length}`,
          label: "repositories",
          verdicts: stats.verdicts.expression,
          verdictTitle: "Repositories using Arrow Functions",
          verdictDescription:
            "These repositories prefer arrow functions/expressions over declarations",
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
        label: "use mixed styles",
        verdicts: stats.verdicts.mixed,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories use both function declarations and arrow functions without a clear preference",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const funcStyleData = getFuncStyleData();
