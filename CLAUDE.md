# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechPref is a project to analyze coding styles across popular TypeScript repositories. The goal is to create a website showing which coding patterns are most common.

## Commands

```bash
# Install dependencies
pnpm install

# Run the repository scanner (fetches top 1000 TS repos from GitHub and clones them)
pnpm scan-repos

# Type check
pnpm --filter scan-repos exec tsc --noEmit
```

Set `GITHUB_TOKEN` environment variable for higher GitHub API rate limits.

## Architecture

This is a pnpm monorepo with packages in `packages/`.

### packages/scan-repos

Fetches and clones top TypeScript repositories from GitHub for analysis.

- `src/github.ts` - GitHub API client using Octokit; fetches repos sorted by stars; caches results to `repositories.json`
- `src/clone.ts` - Shallow clones repositories to `repos/` directory with concurrency control
- `src/index.ts` - Main entry point; loads from cache if available, otherwise fetches and saves

Data flow: Check cache → (fetch from GitHub API → save cache) → clone repos to `repos/{owner}/{repo}`
