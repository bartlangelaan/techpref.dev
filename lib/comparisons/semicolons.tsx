import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getSemicolonsData(): ComparisonData {
  const stats = getBasicStats<"always" | "never">("semi");

  const winningSide =
    stats.verdictPercentages.always >= stats.verdictPercentages.never
      ? "left"
      : "right";

  return {
    slug: "semicolons",
    winningSide,
    title: "Semicolons vs No Semicolons",
    description:
      "To semicolon or not to semicolon? Explore the JavaScript style war with real-world data from popular open source projects.",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "Team Semicolons",
      subtitle:
        "Explicit, traditional, and leaves nothing to chance with JavaScript's automatic semicolon insertion.",
      codeLabel: "example.js (with semicolons)",
      code: `function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

const users = ["Alice", "Bob"];
users.forEach((user) => {
  greet(user);
});`,
      features: [
        "Explicit statement termination",
        "Avoids ASI edge cases and gotchas",
        "Traditional C-family syntax style",
        "Clear visual separation of statements",
        "Safer for minification and bundling",
        "Preferred by TypeScript and Java developers",
      ],
      projects: stats.verdictRepositories.always.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses semicolons",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.always}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.always,
          verdictTitle: "Repositories using Semicolons",
          verdictDescription:
            "These repositories consistently use semicolons at the end of statements",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.always.length}`,
          label: "repositories",
          verdicts: stats.verdicts.always,
          verdictTitle: "Repositories using Semicolons",
          verdictDescription:
            "These repositories consistently use semicolons at the end of statements",
        },
      ],
    },
    rightSide: {
      title: "Team No Semicolons",
      subtitle:
        "Clean, minimal, and trusts JavaScript's automatic semicolon insertion to do the right thing.",
      codeLabel: "example.js (no semicolons)",
      code: `function greet(name) {
  const message = \`Hello, \${name}!\`
  console.log(message)
  return message
}

const users = ["Alice", "Bob"]
users.forEach((user) => {
  greet(user)
})`,
      features: [
        "Cleaner, less cluttered code",
        "Fewer keystrokes and characters",
        "JavaScript handles it automatically",
        "Popular in modern frameworks",
        "Enforced by StandardJS style",
        "Common in Vue.js and other ecosystems",
      ],
      projects: stats.verdictRepositories.never.slice(0, 3).map((p) => ({
        ...p,
        description: "No semicolons",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.verdictPercentages.never}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.never,
          verdictTitle: "Repositories without Semicolons",
          verdictDescription:
            "These repositories omit semicolons, relying on ASI",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.never.length}`,
          label: "repositories",
          verdicts: stats.verdicts.never,
          verdictTitle: "Repositories without Semicolons",
          verdictDescription:
            "These repositories omit semicolons, relying on ASI",
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
          "These repositories have inconsistent semicolon usage",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const semicolonsData = getSemicolonsData();
