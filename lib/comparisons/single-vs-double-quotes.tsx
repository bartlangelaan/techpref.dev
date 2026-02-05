import { BarChart3, TrendingUp, Users } from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";

export function getSingleVsDoubleQuotesData(): ComparisonData {
  const stats = getBasicStats<"single" | "double">("quotes");

  const winningSide =
    stats.verdictPercentages.single >= stats.verdictPercentages.double
      ? "left"
      : "right";

  return {
    slug: "single-vs-double-quotes",
    winningSide,
    title: "Single Quotes vs Double Quotes",
    description:
      "String delimiters matter. Explore the quote preferences across popular TypeScript projects with real-world data.",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "Team Single Quotes",
      subtitle:
        "Minimal visual noise and the de facto standard in modern JavaScript ecosystems.",
      codeLabel: "example.ts (single quotes)",
      code: `const greeting = 'Hello, World!';
const user = {
  name: 'Alice',
  email: 'alice@example.com',
};

const template = 'Welcome, ' + user.name;
const message = \`User: \${user.name}\`;`,
      features: [
        "Less visual noise in code",
        "Requires fewer shift keystrokes",
        "Standard in Vue.js and many modern frameworks",
        "Enforced by StandardJS",
        "Used by most Node.js projects",
        "Cleaner HTML attribute writing",
      ],
      projects: stats.verdictRepositories.single.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses single quotes",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${stats.verdictPercentages.single}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.single,
          verdictTitle: "Repositories using Single Quotes",
          verdictDescription:
            "These repositories consistently prefer single quotes for strings",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${stats.verdicts.single.length}`,
          label: "repositories",
          verdicts: stats.verdicts.single,
          verdictTitle: "Repositories using Single Quotes",
          verdictDescription:
            "These repositories consistently prefer single quotes for strings",
        },
      ],
    },
    rightSide: {
      title: "Team Double Quotes",
      subtitle:
        "Traditional, familiar to backend developers, and emphasizes string values clearly.",
      codeLabel: "example.ts (double quotes)",
      code: `const greeting = "Hello, World!";
const user = {
  name: "Alice",
  email: "alice@example.com",
};

const template = "Welcome, " + user.name;
const message = \`User: \${user.name}\`;`,
      features: [
        "Familiar to most programmers",
        "Matches many other languages (Python, Java, C#)",
        "Clear visual distinction from single quotes",
        "Preferred in JSON and configuration files",
        "Used by Prettier's default configuration",
        "Common in backend TypeScript projects",
      ],
      projects: stats.verdictRepositories.double.slice(0, 3).map((p) => ({
        ...p,
        description: "Uses double quotes",
      })),
      stats: [
        {
          icon: <TrendingUp className="size-5 " />,
          value: `${stats.verdictPercentages.double}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.double,
          verdictTitle: "Repositories using Double Quotes",
          verdictDescription:
            "These repositories consistently prefer double quotes for strings",
        },
        {
          icon: <BarChart3 className="size-5 " />,
          value: `${stats.verdicts.double.length}`,
          label: "repositories",
          verdicts: stats.verdicts.double,
          verdictTitle: "Repositories using Double Quotes",
          verdictDescription:
            "These repositories consistently prefer double quotes for strings",
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
        verdictDescription: "These repositories have inconsistent quote usage",
      },
    ],
  };
}

// Keep backward compatibility with static export
export const singleVsDoubleQuotesData = getSingleVsDoubleQuotesData();
