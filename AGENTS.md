# AGENTS.md

This file provides guidance to agentic coding assistants working in the TechPref repository. TechPref analyzes coding styles across popular TypeScript repositories to identify common patterns.

## Build Commands

### Installation

```bash
pnpm install
```

### Repository Scanner

```bash
# Run full repository scanner (fetch top 1000 TS repos from GitHub and clone them)
pnpm scan-repos

# Individual scanner commands
pnpm --filter scan-repos exec tsx src/fetch-repos.ts
pnpm --filter scan-repos exec tsx src/clone-repos.ts
pnpm --filter scan-repos exec tsx src/analyze-repos.ts
```

### Type Checking & Linting

```bash
# Type check scan-repos package
pnpm --filter scan-repos exec tsc --noEmit

# Build scan-repos package
pnpm --filter scan-repos exec tsc

# Lint Next.js app
pnpm --filter techpref.dev exec eslint .

# Format all code
pnpm format
pnpm format:check
```

### Next.js Development

```bash
# Development server
pnpm --filter techpref.dev exec dev

# Production build
pnpm --filter techpref.dev exec build

# Start production server
pnpm --filter techpref.dev exec start
```

## Code Style Guidelines

### TypeScript Configuration

- Use strict TypeScript with `"strict": true`
- Target ES2022 with NodeNext modules
- Use ES module imports (`import/export`)
- Always provide type annotations for function parameters and return types
- Use `interface` for object shapes, `type` for unions/primitives

### Imports

- Use explicit `.js` extensions for relative imports in Node.js modules (scan-repos package)
- Organize imports automatically via Prettier plugin
- Group imports: external libraries → internal modules → relative modules
- Use named exports preferred over default exports

### Formatting

- Prettier with organize-imports, packagejson, and tailwindcss plugins
- 2-space indentation for consistency
- Use semicolons consistently
- Maximum line length: default Prettier settings
- Trailing commas where permitted

### Naming Conventions

- **Files**: kebab-case (`fetch-repos.ts`, `verdict-dialog.tsx`)
- **Variables/Functions**: camelCase (`cloneRepository`, `repoData`)
- **Classes/Interfaces**: PascalCase (`RepositoryData`, `RuleCheck`)
- **Constants**: UPPER_SNAKE_CASE for top-level constants (`REPO_COUNT`, `MAX_RETRIES`)
- **Types**: PascalCase with descriptive suffixes where appropriate (`ViolationSample`, `VariantResult`)

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages with context
- Use `unknown` type for caught errors, then type guard before accessing properties
- Return boolean success status from utility functions where appropriate
- Log errors with relevant context (repo name, operation type)

### File Organization

- **scan-repos package**:
  - `src/data.ts`: Shared data types and utilities
  - `src/fetch-repos.ts`: GitHub API integration
  - `src/clone-repos.ts`: Git operations
  - `src/analyze-repos.ts`: Analysis logic
  - `src/rules/`: Individual style rule implementations
- **Next.js app**:
  - `app/`: Next.js App Router pages
  - `components/`: Reusable UI components
  - `lib/`: Utility functions and data processing
  - `components/ui/`: Base UI components

### Concurrency & Performance

- Use concurrency control for external operations (CLONE_CONCURRENCY = 5)
- Implement exponential backoff for API rate limiting
- Use shallow Git clones (`--depth 1`) to save disk space
- Cache API responses to `repositories.json`
- Process repositories in batches to avoid memory issues

### React/Next.js Specific

- Use TypeScript with proper props typing
- Use Radix UI components with proper composition
- Apply Tailwind classes via `cn()` utility for conditional styling
- Use Server Components where appropriate, Client Components only when needed
- Follow Next.js 16 App Router patterns

### Testing

- Currently no test framework configured - check for additions in package.json scripts
- When adding tests, follow existing TypeScript patterns and use conventional test locations

## Environment Variables

- `GITHUB_TOKEN`: Required for higher GitHub API rate limits during repository scanning

## Architecture Notes

- pnpm monorepo with packages in `packages/` and apps in `apps/`
- scan-repos package handles data collection and analysis
- Next.js app displays results and comparisons
- Data flows: GitHub API → cache → local clones → analysis → web display
