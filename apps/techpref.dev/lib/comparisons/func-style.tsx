import {
  TrendingUp,
  Code2,
  Zap,
  Eye,
  FileCode,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";
import type { ComparisonData } from "@/components/comparison";
import { getFuncStyleStats } from "@/lib/analysis-results";

export function getFuncStyleData(): ComparisonData {
  const stats = getFuncStyleStats();

  return {
    slug: "func-style",
    title: "Function Declarations vs Arrow Functions",
    description:
      "Two ways to define functions in JavaScript. Explore the tradeoffs between traditional function declarations and modern arrow functions.",
    badgeText: "JavaScript / TypeScript Styleguide",
    leftSide: {
      title: "Function Declarations",
      subtitle:
        "Traditional, hoisted, and with their own 'this' binding. The classic way to define functions.",
      badge: "Traditional",
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
      projects:
        stats.declarationProjects.length > 0
          ? stats.declarationProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: "Prefers function declarations",
            }))
          : [
              {
                name: "Lodash",
                stars: "59k",
                url: "https://github.com/lodash/lodash",
                description:
                  "A modern JavaScript utility library delivering modularity, performance, & extras.",
              },
              {
                name: "Express",
                stars: "64k",
                url: "https://github.com/expressjs/express",
                description:
                  "Fast, unopinionated, minimalist web framework for Node.js",
              },
              {
                name: "Moment.js",
                stars: "48k",
                url: "https://github.com/moment/moment",
                description:
                  "Parse, validate, manipulate, and display dates in JavaScript.",
              },
            ],
      influencers: [
        {
          name: "Kyle Simpson",
          role: "Author of You Don't Know JS",
          quote:
            "Function declarations are more explicit about their intent and behavior.",
          avatar: "/developer-portrait-kyle.jpg",
        },
        {
          name: "Douglas Crockford",
          role: "Creator of JSON",
          quote:
            "Named functions make debugging easier with clear stack traces.",
          avatar: "/developer-portrait-douglas.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.declarationPercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.declarationRepos}`,
          label: "repositories",
        },
        {
          icon: <Code2 className="h-5 w-5" />,
          value: "100%",
          label: "Browser support",
        },
        {
          icon: <Clock className="h-5 w-5" />,
          value: "1995",
          label: "Available since",
        },
      ],
    },
    rightSide: {
      title: "Arrow Functions",
      subtitle:
        "Concise, lexically-scoped 'this', and perfect for callbacks and functional programming.",
      badge: "Modern",
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
      projects:
        stats.expressionProjects.length > 0
          ? stats.expressionProjects.slice(0, 3).map((p) => ({
              name: p.name,
              stars: "",
              url: p.url,
              description: "Prefers arrow functions",
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
                name: "Vue.js",
                stars: "207k",
                url: "https://github.com/vuejs/vue",
                description: "The Progressive JavaScript Framework.",
              },
              {
                name: "Next.js",
                stars: "124k",
                url: "https://github.com/vercel/next.js",
                description: "The React Framework for the Web",
              },
            ],
      influencers: [
        {
          name: "Dan Abramov",
          role: "React Core Team",
          quote:
            "Arrow functions make React components cleaner and avoid 'this' confusion.",
          avatar: "/developer-portrait-dan.jpg",
        },
        {
          name: "Wes Bos",
          role: "JavaScript Educator",
          quote:
            "Arrow functions are perfect for callbacks - concise and no 'this' surprises.",
          avatar: "/developer-portrait-wes.jpg",
        },
      ],
      stats: [
        {
          icon: <TrendingUp className="h-5 w-5" />,
          value: `${stats.expressionPercent}%`,
          label: "of analyzed repos",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          value: `${stats.expressionRepos}`,
          label: "repositories",
        },
        {
          icon: <Code2 className="h-5 w-5" />,
          value: "-40%",
          label: "Less boilerplate",
        },
        {
          icon: <FileCode className="h-5 w-5" />,
          value: "ES6+",
          label: "Available since",
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
        value: "func-style",
        label: "ESLint rule used",
      },
      {
        icon: <Zap className="h-6 w-6" />,
        value: "0ms",
        label: "performance difference",
      },
    ],
    conclusion: {
      title: "The Real Answer?",
      description:
        "Use arrow functions for callbacks and short functions. Use declarations for top-level functions and when you need hoisting or 'this' binding.",
      tools: ["ESLint", "TypeScript", "Prettier", "Biome"],
    },
  };
}

// Keep backward compatibility with static export
export const funcStyleData = getFuncStyleData();
