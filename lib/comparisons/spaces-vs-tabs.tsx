import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function getSpacesVsTabsData(): ComparisonData {
  const stats = getBasicStats<'2-space' | '4-space' | 'tab'>('indent');

  const spacesVerdicts = [
    ...stats.verdicts['2-space'],
    ...stats.verdicts['4-space'],
  ];

  const spacesRepos = [
    ...stats.verdictRepositories['2-space'],
    ...stats.verdictRepositories['4-space'],
  ];
  
  // Calculate totals and percentages for spaces vs tabs
  const definiteRepos = spacesVerdicts.length + stats.verdicts.tab.length;
  const spacesPercent = definiteRepos > 0 ? Math.round((spacesVerdicts.length / definiteRepos) * 100) : 0;
  const tabsPercent = definiteRepos > 0 ? Math.round((stats.verdictRepositories.tab.length / definiteRepos) * 100) : 0;

  return {
    slug: "spaces-vs-tabs",
    title: "Spaces vs Tabs",
    description:
      "The eternal debate in code formatting. Explore both sides with real-world data, popular project preferences, and expert opinions.",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "Team Spaces",
      subtitle:
        "Precise, consistent, and universally rendered the same way across all environments and editors.",
      badge: "Industry Standard",
      codeLabel: "example.js (2 spaces)",
      code: `function calculateTotal(items) {
  return items
    .filter(item => item.active)
    .reduce((sum, item) => {
      return sum + item.price;
    }, 0);
}`,
      showWhitespace: true,
      features: [
        "Consistent appearance across all editors and platforms",
        "Precise control over alignment and formatting",
        "Industry standard for most JavaScript projects",
        "Prevents tab/space mixing issues",
        "Recommended by Prettier and ESLint defaults",
        "Easier code review with predictable spacing",
      ],
      projects: spacesRepos.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses spaces for indentation",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${spacesPercent}%`,
          label: "of analyzed repos",
          verdicts: spacesVerdicts,
          verdictTitle: "Repositories using Spaces",
          verdictDescription:
            "These repositories use space-based indentation (2 or 4 spaces)",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${spacesVerdicts.length}`,
          label: "repositories",
          verdicts: spacesVerdicts,
          verdictTitle: "Repositories using Spaces",
          verdictDescription:
            "These repositories use space-based indentation (2 or 4 spaces)",
        },
      ],
    },
    rightSide: {
      title: "Team Tabs",
      subtitle:
        "Semantic, accessible, and respects individual developer preferences for display width.",
      badge: "Developer Choice",
      codeLabel: "example.js (tabs)",
      code: `function calculateTotal(items) {
	return items
		.filter(item => item.active)
		.reduce((sum, item) => {
			return sum + item.price;
		}, 0);
}`,
      showWhitespace: true,
      features: [
        "Semantic meaning: one indent = one tab character",
        "Customizable display width per developer preference",
        "More accessible for visually impaired developers",
        "Smaller file sizes with fewer characters",
        "Faster navigation with keyboard shortcuts",
        "Respects individual workspace settings",
      ],
      projects: stats.verdictRepositories.tab.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: "Uses tabs for indentation",
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${tabsPercent}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts.tab,
          verdictTitle: "Repositories using Tabs",
          verdictDescription: "These repositories use tab-based indentation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts.tab.length}`,
          label: "repositories",
          verdicts: stats.verdicts.tab,
          verdictTitle: "Repositories using Tabs",
          verdictDescription: "These repositories use tab-based indentation",
        },
      ],
    },
    bottomStats: [
      {
        icon: <BarChart3 className="h-6 w-6" />,
        value: `${stats.allVerdicts.length}`,
        label: "repositories analyzed",
      },
      {
        icon: <Users className="h-6 w-6" />,
        value: `${stats.verdicts.mixed.length}`,
        label: "use mixed styles",
        verdicts: stats.verdicts.mixed,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription:
          "These repositories have inconsistent indentation or no clear preference",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Pick one, configure your formatter, and never think about it again. Consistency within your codebase matters more than the choice itself.",
      tools: ["Prettier", "ESLint", "EditorConfig", "Biome"],
    },
  };
}

// Keep backward compatibility with static export
export const spacesVsTabsData = getSpacesVsTabsData();
