import type { ComparisonData } from "@/components/comparison";
import { getIndentStats } from "@/lib/analysis-results";
import {
  BarChart3,
  Eye,
  FileCode,
  Monitor,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

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
      features: [
        "More code visible on screen at once",
        "Preferred by Google, Airbnb, and npm",
        "Standard for most JavaScript projects",
        "Better for deeply nested code",
        "Reduces horizontal scrolling",
        "Default in Prettier for JavaScript",
      ],
      projects:
        stats.twoSpaceProjects.length > 0
          ? stats.twoSpaceProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: `Uses 2-space indentation`,
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
                name: "Node.js",
                stars: "106k",
                url: "https://github.com/nodejs/node",
                description: "Node.js JavaScript runtime",
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
          name: "Addy Osmani",
          role: "Chrome DevRel Lead",
          quote:
            "2 spaces strike the perfect balance between readability and code density.",
          avatar: "/developer-portrait-addy.jpg",
        },
        {
          name: "Sindre Sorhus",
          role: "Open Source Developer",
          quote:
            "With modern editors, 2 spaces provide enough visual distinction.",
          avatar: "/developer-portrait-sindre.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.twoSpacePercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.twoSpaceRepos}`,
          label: "repositories",
        },
        {
          icon: <Monitor className="h-5 w-5" />,
          value: "80col",
          label: "Fits in standard width",
        },
        {
          icon: <Eye className="h-5 w-5" />,
          value: "+25%",
          label: "More code on screen",
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
      features: [
        "Clearer visual hierarchy at a glance",
        "Standard in Python, C#, and Java",
        "Better for beginners learning to code",
        "Easier to spot nesting levels",
        "Preferred in enterprise environments",
        "More accessible for developers with vision issues",
      ],
      projects:
        stats.fourSpaceProjects.length > 0
          ? stats.fourSpaceProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: `Uses 4-space indentation`,
            }))
          : [
              {
                name: "TypeScript",
                stars: "100k",
                url: "https://github.com/microsoft/TypeScript",
                description:
                  "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
              },
              {
                name: "VS Code",
                stars: "162k",
                url: "https://github.com/microsoft/vscode",
                description: "Visual Studio Code - Code editing. Redefined.",
              },
              {
                name: "Angular",
                stars: "96k",
                url: "https://github.com/angular/angular",
                description: "The modern web developer's platform.",
              },
            ],
      influencers: [
        {
          name: "Anders Hejlsberg",
          role: "Creator of TypeScript",
          quote:
            "4 spaces provide clear visual boundaries that help prevent nesting errors.",
          avatar: "/developer-portrait-anders.jpg",
        },
        {
          name: "Martin Fowler",
          role: "Software Development Author",
          quote:
            "Generous whitespace improves code comprehension significantly.",
          avatar: "/developer-portrait-martin.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.fourSpacePercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.fourSpaceRepos}`,
          label: "repositories",
        },
        {
          icon: <FileCode className="h-5 w-5" />,
          value: "2x",
          label: "Indent visibility",
        },
        {
          icon: <Users className="h-5 w-5" />,
          value: "+18%",
          label: "Easier nesting detection",
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
        "Follow your project's existing convention. If starting fresh, 2 spaces is the JavaScript community standard, but 4 spaces is fine too.",
      tools: ["Prettier", "ESLint", "EditorConfig", ".editorconfig"],
    },
  };
}

// Keep backward compatibility with static export
export const twoVsFourSpacesData = getTwoVsFourSpacesData();
