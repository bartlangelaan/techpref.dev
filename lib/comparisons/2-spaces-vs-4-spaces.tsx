import type { ComparisonData } from "@/components/comparison";
import { getBasicStats } from "@/lib/analysis-results";
import { BarChart3, FileCode, TrendingUp, Users } from "lucide-react";

export function getTwoVsFourSpacesData(): ComparisonData {
  const stats = getBasicStats<'2-space' | '4-space' | 'tab'>('indent');
  
  // Calculate totals and percentages for 2-space vs 4-space (excluding tab)
  const spacesOnly = stats.verdicts['2-space'].length + stats.verdicts['4-space'].length;
  const twoSpacePercent = spacesOnly > 0 ? Math.round((stats.verdicts['2-space'].length / spacesOnly) * 100) : 0;
  const fourSpacePercent = spacesOnly > 0 ? Math.round((stats.verdicts['4-space'].length / spacesOnly) * 100) : 0;

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
      projects: stats.verdictRepositories['2-space'].slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: `Uses 2-space indentation`,
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${twoSpacePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts['2-space'],
          verdictTitle: "Repositories using 2-Space Indentation",
          verdictDescription: "These repositories use 2-space indentation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts['2-space'].length}`,
          label: "repositories",
          verdicts: stats.verdicts['2-space'],
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
      projects: stats.verdictRepositories['4-space'].slice(0, 3).map((p) => ({
        name: p.name,
        stars: "",
        url: p.url,
        description: `Uses 4-space indentation`,
      })),
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${fourSpacePercent}%`,
          label: "of analyzed repos",
          verdicts: stats.verdicts['4-space'],
          verdictTitle: "Repositories using 4-Space Indentation",
          verdictDescription: "These repositories use 4-space indentation",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.verdicts['4-space'].length}`,
          label: "repositories",
          verdicts: stats.verdicts['4-space'],
          verdictTitle: "Repositories using 4-Space Indentation",
          verdictDescription: "These repositories use 4-space indentation",
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
        icon: <FileCode className="h-6 w-6" />,
        value: `${stats.verdicts.tab.length}`,
        label: "use tabs instead",
      },
      {
        icon: <Users className="h-6 w-6" />,
        value: `${stats.verdicts.mixed.length}`,
        label: "use mixed styles",
        verdicts: stats.verdicts.mixed,
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
