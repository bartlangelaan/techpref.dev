# TechPref

TechPref analyzes coding styles across popular TypeScript repositories to identify common patterns and preferences. Visit [techpref.dev](https://techpref.dev) to see the results.

## Project Structure

```
techpref.dev/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── comparison/       # Comparison page components
│   └── ui/               # Base UI components (Radix UI)
├── lib/                  # Shared utilities and data processing
│   ├── types.ts          # Shared TypeScript types
│   ├── analysis-results.ts  # Statistics calculations
│   ├── comparisons/      # Comparison data definitions
│   └── utils.ts          # Utility functions
├── scripts/              # Data collection scripts
│   ├── fetch-repos.ts    # Fetch top repos from GitHub
│   ├── clone-repos.ts    # Clone repositories locally
│   ├── analyze-repos.ts  # Run ESLint analysis
│   └── rules/            # ESLint rule definitions
├── data/                 # Generated analysis data
│   └── repositories.json # Repository metadata and analysis results
└── repos/                # Cloned repositories (gitignored)
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Visit http://localhost:3000 to see the site.

### Data Collection

To analyze repositories yourself:

```bash
# Set GitHub token for higher API rate limits (optional but recommended)
export GITHUB_TOKEN=your_token_here

# Run all steps: fetch, clone, and analyze
pnpm scan-repos

# Or run individual steps:
pnpm fetch-repos   # Fetch top 1000 TypeScript repos from GitHub
pnpm clone-repos   # Clone repositories locally (shallow clones)
pnpm analyze-repos # Run ESLint analysis on all repos
```

## Available Commands

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Start development server          |
| `pnpm build`         | Build for production              |
| `pnpm start`         | Start production server           |
| `pnpm lint`          | Run ESLint                        |
| `pnpm format`        | Format code with Prettier         |
| `pnpm format:check`  | Check code formatting             |
| `pnpm scan-repos`    | Run full data collection pipeline |
| `pnpm fetch-repos`   | Fetch repository list from GitHub |
| `pnpm clone-repos`   | Clone repositories                |
| `pnpm analyze-repos` | Analyze cloned repositories       |

## How It Works

1. **Fetch**: Queries GitHub API for top 1000 TypeScript repositories by stars
2. **Clone**: Shallow clones each repository to `repos/` directory
3. **Analyze**: Runs ESLint with specific rules to detect coding patterns
4. **Display**: Next.js app reads analysis results and displays comparisons

### Adding New Rules

To add a new style comparison:

1. Create a new rule file in `scripts/rules/` (e.g., `quotes.ts`)
2. Export rule checks with ESLint configurations
3. Add to `scripts/rules/index.ts`
4. Create a comparison component in `lib/comparisons/`
5. Add statistics calculation in `lib/analysis-results.ts`

## Environment Variables

| Variable       | Description                                             |
| -------------- | ------------------------------------------------------- |
| `GITHUB_TOKEN` | GitHub personal access token for higher API rate limits |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Analysis**: ESLint with typescript-eslint
- **Language**: TypeScript

## License

MIT
