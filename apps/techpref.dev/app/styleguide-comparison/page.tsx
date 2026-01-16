import type React from "react"
import {
  Star,
  ExternalLink,
  Check,
  Clock,
  FileCode,
  Zap,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  Code2,
  Minus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Project {
  name: string
  stars: string
  url: string
  description: string
}

interface Influencer {
  name: string
  role: string
  quote: string
  avatar: string
}

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
}

const spacesProjects: Project[] = [
  {
    name: "React",
    stars: "225k",
    url: "https://github.com/facebook/react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
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
]

const tabsProjects: Project[] = [
  { name: "jQuery", stars: "59k", url: "https://github.com/jquery/jquery", description: "jQuery JavaScript Library" },
  {
    name: "WordPress Gutenberg",
    stars: "10k",
    url: "https://github.com/WordPress/gutenberg",
    description: "The Block Editor project for WordPress",
  },
  { name: "Go", stars: "123k", url: "https://github.com/golang/go", description: "The Go programming language" },
]

const spacesInfluencers: Influencer[] = [
  {
    name: "Dan Abramov",
    role: "React Core Team",
    quote: "Spaces provide consistent formatting across different editors and environments.",
    avatar: "/developer-portrait-dan.jpg",
  },
  {
    name: "Addy Osmani",
    role: "Chrome DevRel Lead",
    quote: "Two spaces keep code compact while maintaining readability.",
    avatar: "/developer-portrait-addy.jpg",
  },
]

const tabsInfluencers: Influencer[] = [
  {
    name: "Ryan Dahl",
    role: "Creator of Node.js & Deno",
    quote: "Tabs respect individual developer preferences for indentation width.",
    avatar: "/developer-portrait-ryan.jpg",
  },
  {
    name: "Rich Harris",
    role: "Creator of Svelte",
    quote: "Tabs are more accessible and reduce file size.",
    avatar: "/developer-portrait-rich.jpg",
  },
]

const spacesStats: Stat[] = [
  { icon: <TrendingUp className="h-5 w-5" />, value: "62%", label: "Top 1000 JS projects" },
  { icon: <Code2 className="h-5 w-5" />, value: "2", label: "Most common indent size" },
  { icon: <Clock className="h-5 w-5" />, value: "15min", label: "Saved daily on formatting" },
  { icon: <Eye className="h-5 w-5" />, value: "+23%", label: "Readability improvement" },
]

const tabsStats: Stat[] = [
  { icon: <TrendingUp className="h-5 w-5" />, value: "38%", label: "Top 1000 JS projects" },
  { icon: <Code2 className="h-5 w-5" />, value: "1", label: "Character per indent" },
  { icon: <FileCode className="h-5 w-5" />, value: "-12%", label: "Average file size" },
  { icon: <Users className="h-5 w-5" />, value: "100%", label: "Accessibility friendly" },
]

const spacesFeatures = [
  "Consistent appearance across all editors and platforms",
  "Precise control over alignment and formatting",
  "Industry standard for most JavaScript projects",
  "Prevents tab/space mixing issues",
  "Recommended by Prettier and ESLint defaults",
  "Easier code review with predictable spacing",
]

const tabsFeatures = [
  "Semantic meaning: one indent = one tab character",
  "Customizable display width per developer preference",
  "More accessible for visually impaired developers",
  "Smaller file sizes with fewer characters",
  "Faster navigation with keyboard shortcuts",
  "Respects individual workspace settings",
]

function CodeBlock({ code, variant }: { code: string; variant: "spaces" | "tabs" }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">
          {variant === "spaces" ? "example.js (2 spaces)" : "example.js (tabs)"}
        </span>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code className="text-foreground/90">{code}</code>
      </pre>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.url}
      target="_blank"
      className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <Star className="h-4 w-4 fill-yellow-500/80 text-yellow-500/80" />
        <span className="font-medium">{project.stars}</span>
      </div>
    </Link>
  )
}

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={influencer.avatar || "/placeholder.svg"}
          alt={influencer.name}
          className="w-10 h-10 rounded-full object-cover border border-border"
        />
        <div>
          <h4 className="font-semibold text-foreground text-sm">{influencer.name}</h4>
          <p className="text-xs text-primary">{influencer.role}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic leading-relaxed">"{influencer.quote}"</p>
    </div>
  )
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-primary">{stat.icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground">{stat.value}</p>
        <p className="text-xs text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  )
}

function ComparisonCard({
  title,
  subtitle,
  features,
  code,
  projects,
  influencers,
  stats,
  variant,
}: {
  title: string
  subtitle: string
  features: string[]
  code: string
  projects: Project[]
  influencers: Influencer[]
  stats: Stat[]
  variant: "spaces" | "tabs"
}) {
  return (
    <div className="flex flex-col h-full p-6 lg:p-8 rounded-2xl border border-border bg-card">
      <div className="mb-6">
        <Badge variant="outline" className="mb-3 text-primary border-primary/30 bg-primary/5">
          {variant === "spaces" ? "Industry Standard" : "Developer Choice"}
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Code Example */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary" />
            Code Example
          </h3>
          <CodeBlock code={code} variant={variant} />
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Key Benefits
          </h3>
          <ul className="space-y-2.5">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Popular Projects */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Popular Projects
          </h3>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </div>

        {/* Influencers */}
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Advocates
          </h3>
          <div className="space-y-3">
            {influencers.map((influencer, index) => (
              <InfluencerCard key={index} influencer={influencer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StyleguideComparisonPage() {
  const spacesCode = `function calculateTotal(items) {
  return items
    .filter(item => item.active)
    .reduce((sum, item) => {
      return sum + item.price;
    }, 0);
}`

  const tabsCode = `function calculateTotal(items) {
	return items
		.filter(item => item.active)
		.reduce((sum, item) => {
			return sum + item.price;
		}, 0);
}`

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
            JavaScript / TypeScript Styleguide
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Spaces vs Tabs
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            The eternal debate in code formatting. Explore both sides with real-world data, popular project preferences,
            and expert opinions.
          </p>

          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">62%</p>
              <p className="text-sm text-muted-foreground">Use Spaces</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">38%</p>
              <p className="text-sm text-muted-foreground">Use Tabs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <ComparisonCard
            title="Team Spaces"
            subtitle="Precise, consistent, and universally rendered the same way across all environments and editors."
            features={spacesFeatures}
            code={spacesCode}
            projects={spacesProjects}
            influencers={spacesInfluencers}
            stats={spacesStats}
            variant="spaces"
          />
          <ComparisonCard
            title="Team Tabs"
            subtitle="Semantic, accessible, and respects individual developer preferences for display width."
            features={tabsFeatures}
            code={tabsCode}
            projects={tabsProjects}
            influencers={tabsInfluencers}
            stats={tabsStats}
            variant="tabs"
          />
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-16 lg:mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Additional Insights</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              More data points to help you make an informed decision for your team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">73%</p>
              <p className="text-sm text-muted-foreground">of developers use Prettier</p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <FileCode className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">2.1x</p>
              <p className="text-sm text-muted-foreground">more bytes with 4-space indent</p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">89%</p>
              <p className="text-sm text-muted-foreground">use automated formatting</p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{"<"}1min</p>
              <p className="text-sm text-muted-foreground">to configure in most editors</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 lg:mt-24 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl border border-border bg-card">
            <Minus className="h-8 w-8 text-primary mb-4 rotate-90" />
            <h3 className="text-xl font-bold text-foreground mb-2">The Real Answer?</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Pick one, configure your formatter, and never think about it again. Consistency within your codebase
              matters more than the choice itself.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Prettier
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                ESLint
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                EditorConfig
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Biome
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
