import type { ComparisonData } from "@/components/comparison";
import { getSpacesVsTabsStats } from "@/lib/analysis-results";
import {
  BarChart3,
  Code2,
  Eye,
  FileCode,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export function getSpacesVsTabsData(): ComparisonData {
  const stats = getSpacesVsTabsStats();

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
      features: [
        "Consistent appearance across all editors and platforms",
        "Precise control over alignment and formatting",
        "Industry standard for most JavaScript projects",
        "Prevents tab/space mixing issues",
        "Recommended by Prettier and ESLint defaults",
        "Easier code review with predictable spacing",
      ],
      projects:
        stats.spacesProjects.length > 0
          ? stats.spacesProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: "Uses spaces for indentation",
            }))
          : [
              {
                name: "React",
                stars: "225k",
                url: "https://github.com/facebook/react",
                description:
                  "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
              },
              {
                name: "Angular",
                stars: "96k",
                url: "https://github.com/angular/angular",
                description: "The modern web developer's platform.",
              },
              {
                name: "Airbnb JavaScript Style Guide",
                stars: "144k",
                url: "https://github.com/airbnb/javascript",
                description: "JavaScript Style Guide",
              },
            ],
      influencers: [
        {
          name: "Dan Abramov",
          role: "React Core Team",
          quote:
            "Spaces provide consistent formatting across different editors and environments.",
          avatar: "/developer-portrait-dan.jpg",
        },
        {
          name: "Addy Osmani",
          role: "Chrome DevRel Lead",
          quote: "Two spaces keep code compact while maintaining readability.",
          avatar: "/developer-portrait-addy.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.spacesPercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.spacesRepos}`,
          label: "repositories",
        },
        {
          icon: <Code2 className="h-5 w-5" />,
          value: "2",
          label: "Most common indent size",
        },
        {
          icon: <Eye className="h-5 w-5" />,
          value: "+23%",
          label: "Readability improvement",
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
      features: [
        "Semantic meaning: one indent = one tab character",
        "Customizable display width per developer preference",
        "More accessible for visually impaired developers",
        "Smaller file sizes with fewer characters",
        "Faster navigation with keyboard shortcuts",
        "Respects individual workspace settings",
      ],
      projects:
        stats.tabsProjects.length > 0
          ? stats.tabsProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: "Uses tabs for indentation",
            }))
          : [
              {
                name: "jQuery",
                stars: "59k",
                url: "https://github.com/jquery/jquery",
                description: "jQuery JavaScript Library",
              },
              {
                name: "WordPress Gutenberg",
                stars: "10k",
                url: "https://github.com/WordPress/gutenberg",
                description: "The Block Editor project for WordPress",
              },
              {
                name: "Go",
                stars: "123k",
                url: "https://github.com/golang/go",
                description: "The Go programming language",
              },
            ],
      influencers: [
        {
          name: "Ryan Dahl",
          role: "Creator of Node.js & Deno",
          quote:
            "Tabs respect individual developer preferences for indentation width.",
          avatar: "/developer-portrait-ryan.jpg",
        },
        {
          name: "Rich Harris",
          role: "Creator of Svelte",
          quote: "Tabs are more accessible and reduce file size.",
          avatar: "/developer-portrait-rich.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.tabsPercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.tabsRepos}`,
          label: "repositories",
        },
        {
          icon: <Code2 className="h-5 w-5" />,
          value: "1",
          label: "Character per indent",
        },
        {
          icon: <Users className="h-5 w-5" />,
          value: "100%",
          label: "Accessibility friendly",
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
        icon: <Users className="h-6 w-6" />,
        value: `${stats.mixedRepos}`,
        label: "use mixed styles",
      },
      {
        icon: <FileCode className="h-6 w-6" />,
        value: "2.1x",
        label: "more bytes with 4-space indent",
      },
      {
        icon: <Zap className="h-6 w-6" />,
        value: "0",
        label: "performance impact",
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
