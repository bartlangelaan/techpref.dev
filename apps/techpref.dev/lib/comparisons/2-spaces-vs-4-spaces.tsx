import type { ComparisonData } from "@/components/comparison";
import { getIndentStats } from "@/lib/analysis-results";
import { BarChart3, FileCode, TrendingUp, Users } from "lucide-react";

export function getTwoVsFourSpacesData(): ComparisonData {
  const stats = getIndentStats();

  return {
    slug: "2-spaces-vs-4-spaces",
    title: "2 Spaces vs 4 Spaces",
    description:
      "The indent width debate. Does more space mean better readability, or is compact code easier to scan?",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "2 Spaces",
      subtitle:
        "Compact, allowing more code on screen while maintaining clear visual hierarchy.",
      badge: "Compact",
      codeLabel: "example.js (2 spaces)",
      code: `function processOrder(order) {
  if (order.items.length > 0) {
    return order.items
      .filter(item => item.inStock)
      .map(item => ({
        name: item.name,
        total: item.price * item.quantity
      }));
  }
  return [];
}`,
      showWhitespace: true,
      features: [
        "More code visible on screen at once",
        "Preferred by Google, Airbnb, and npm",
        "Standard for most JavaScript projects",
        "Better for deeply nested code",
        "Reduces horizontal scrolling",
        "Default in Prettier for JavaScript",
      ],
      projects: stats.twoSpaceProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: `Uses 2-space indentation`,
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.twoSpacePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.twoSpaceVerdicts,
          verdictTitle: "Repositories using 2-Space Indentation",
          verdictDescription: "These repositories use 2-space indentation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.twoSpaceRepos}`,
          label: "repositories",
          verdicts: stats.twoSpaceVerdicts,
          verdictTitle: "Repositories using 2-Space Indentation",
          verdictDescription: "These repositories use 2-space indentation",
        },
      ],
    },
    rightSide: {
      title: "4 Spaces",
      subtitle:
        "Clear visual separation with generous indentation for maximum readability.",
      badge: "Readable",
      codeLabel: "example.js (4 spaces)",
      code: `function processOrder(order) {
    if (order.items.length > 0) {
        return order.items
            .filter(item => item.inStock)
            .map(item => ({
                name: item.name,
                total: item.price * item.quantity
            }));
    }
    return [];
}`,
      showWhitespace: true,
      features: [
        "Clearer visual hierarchy at a glance",
        "Standard in Python, C#, and Java",
        "Better for beginners learning to code",
        "Easier to spot nesting levels",
        "Preferred in enterprise environments",
        "More accessible for developers with vision issues",
      ],
      projects: stats.fourSpaceProjects.slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: `Uses 4-space indentation`,
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.fourSpacePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.fourSpaceVerdicts,
          verdictTitle: "Repositories using 4-Space Indentation",
          verdictDescription: "These repositories use 4-space indentation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.fourSpaceRepos}`,
          label: "repositories",
          verdicts: stats.fourSpaceVerdicts,
          verdictTitle: "Repositories using 4-Space Indentation",
          verdictDescription: "These repositories use 4-space indentation",
        },
      ],
    },
    bottomStats: [
      {
        icon: <BarChart3 className="h-6 w-6" />,
        value: `${stats.totalRepos}`,
        label: "repositories analyzed",
      },
      {
        icon: <FileCode className="h-6 w-6" />,
        value: `${stats.tabRepos}`,
        label: "use tabs instead",
      },
      {
        icon: <Users className="h-6 w-6" />,
        value: `${stats.mixedRepos}`,
        label: "use mixed styles",
        verdicts: stats.mixedVerdicts,
        verdictTitle: "Repositories with Mixed Styles",
        verdictDescription: "These repositories have inconsistent indentation",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Follow your project's existing convention. If starting fresh, 2 spaces is the JavaScript community standard, but 4 spaces is fine too.",
      tools: ["Prettier", "ESLint", "EditorConfig", ".editorconfig"],
    },
  };
}

// Keep backward compatibility with static export
export const twoVsFourSpacesData = getTwoVsFourSpacesData();
