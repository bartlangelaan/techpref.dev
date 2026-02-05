# AGENTS.md

This file provides guidance to AI coding assistants working in the TechPref repository. TechPref analyzes coding styles across popular TypeScript repositories to identify common patterns.

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
│   ├── analyze-repos.ts  # Run Oxlint/ESLint analysis
│   └── rules/            # Linter rule definitions (Oxlint or ESLint)
├── data/                 # Generated analysis data
│   └── repositories.json # Repository metadata and analysis results
└── repos/                # Cloned repositories (gitignored)
```

## Build Commands

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev          # Start Next.js development server
pnpm build        # Build for production
pnpm start        # Start production server
```

The development server runs at **http://localhost:3000**. Example pages:

- http://localhost:3000/ (homepage with all comparisons)
- http://localhost:3000/spaces-vs-tabs (individual comparison page)
- http://localhost:3000/func-style (function declarations vs arrow functions)

**Note:** Next.js uses React Fast Refresh, so after editing code the browser will automatically update without needing a manual refresh or navigation.

### Linting & Formatting

```bash
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

### Data Collection Scripts

```bash
# Run full pipeline: fetch, clone, and analyze
pnpm scan-repos

# Or run individual steps:
pnpm fetch-repos   # Fetch top 1000 TypeScript repos from GitHub API
pnpm clone-repos   # Clone repositories locally (shallow clones)
pnpm analyze-repos # Run Oxlint/ESLint analysis on all cloned repos
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with `"strict": true`
- Target ES2022 with bundler module resolution
- Use `interface` for object shapes, `type` for unions/primitives
- Always provide type annotations for function parameters

### Imports

- Use `@/` path alias for imports (e.g., `@/lib/types`)
- Organize imports automatically via Prettier plugin
- Prefer named exports over default exports

### Formatting

- Prettier with organize-imports, packagejson, and tailwindcss plugins
- 2-space indentation
- Semicolons required
- Trailing commas where permitted

### Naming Conventions

- **Files**: kebab-case (`fetch-repos.ts`, `verdict-dialog.tsx`)
- **Variables/Functions**: camelCase (`cloneRepository`, `repoData`)
- **Interfaces/Types**: PascalCase (`RepositoryData`, `RuleCheck`)
- **Constants**: UPPER_SNAKE_CASE (`REPO_COUNT`, `MAX_RETRIES`)

### Error Handling

- Use try-catch blocks for async operations
- Use `unknown` type for caught errors, then type guard before accessing properties
- Log errors with relevant context (repo name, operation type)

### React/Next.js

- Use TypeScript with proper props typing
- Use Radix UI components with proper composition
- Apply Tailwind classes via `cn()` utility for conditional styling
- Use Server Components by default, Client Components only when needed
- Follow Next.js 16 App Router patterns

## Data Flow

1. **Fetch** (`pnpm fetch-repos`): Queries GitHub API for top 1000 TypeScript repos
2. **Clone** (`pnpm clone-repos`): Shallow clones each repository to `repos/`
3. **Analyze** (`pnpm analyze-repos`): Runs Oxlint/ESLint rules to detect coding patterns
4. **Display**: Next.js app reads `data/repositories.json` and displays comparisons

## Adding New Style Rules

1. Create rule file in `scripts/rules/` (e.g., `quotes.ts`)
2. Export rule checks using the appropriate type:
   - `OxlintRuleCheck[]` if Oxlint supports the rule (faster)
   - `EslintRuleCheck[]` if only ESLint supports the rule
3. Add to `allRuleChecks` in `scripts/rules/index.ts`
4. Add statistics function in `lib/analysis-results.ts`
5. Create comparison component in `lib/comparisons/`

The analyzer automatically uses the correct linter based on the rule configuration.

## Environment Variables

| Variable       | Description                                             |
| -------------- | ------------------------------------------------------- |
| `GITHUB_TOKEN` | GitHub personal access token for higher API rate limits |

## Performance Notes

- Clone concurrency is limited to 5 parallel operations
- Exponential backoff is used for GitHub API rate limiting
- Shallow clones (`--depth 1`) are used to save disk space
- Analysis results are saved after each repository to preserve progress
