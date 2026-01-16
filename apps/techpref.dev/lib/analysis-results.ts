import analysisData from "../repo-analysis-results.json"

export interface RepoAnalysisResult {
  repoFullName: string
  analyzedAt: string
  checks: {
    [ruleId: string]: {
      [variant: string]: number
    }
  }
}

export interface AnalysisOutput {
  startedAt: string
  results: RepoAnalysisResult[]
}

export function getAnalysisResults(): AnalysisOutput {
  return analysisData as AnalysisOutput
}

/**
 * For indent checks, the values represent violations of that style.
 * A repo "prefers" the style with the LEAST violations.
 *
 * This function determines which indent style each repo uses
 * and returns aggregated statistics.
 */
export function getIndentStats() {
  const results = getAnalysisResults().results

  let twoSpaceRepos = 0
  let fourSpaceRepos = 0
  let tabRepos = 0
  let mixedRepos = 0

  const twoSpaceProjects: { name: string; stars?: string; url: string }[] = []
  const fourSpaceProjects: { name: string; stars?: string; url: string }[] = []

  for (const repo of results) {
    const indent = repo.checks["indent"]
    if (!indent) continue

    const twoSpaceViolations = indent["2-space"] ?? Infinity
    const fourSpaceViolations = indent["4-space"] ?? Infinity
    const tabViolations = indent["tab"] ?? Infinity

    // Find the style with minimum violations (that's the style they use)
    const minViolations = Math.min(twoSpaceViolations, fourSpaceViolations, tabViolations)

    // Check if there's a clear winner or if it's mixed
    const styles = [
      { style: "2-space", violations: twoSpaceViolations },
      { style: "4-space", violations: fourSpaceViolations },
      { style: "tab", violations: tabViolations },
    ].sort((a, b) => a.violations - b.violations)

    // If the top two are very close, consider it mixed
    const isMixed = styles[0].violations > 0 &&
      styles[1].violations / styles[0].violations < 1.5

    const repoUrl = `https://github.com/${repo.repoFullName}`
    const repoName = repo.repoFullName.split("/")[1] ?? repo.repoFullName

    if (isMixed) {
      mixedRepos++
    } else if (minViolations === twoSpaceViolations) {
      twoSpaceRepos++
      if (twoSpaceProjects.length < 5) {
        twoSpaceProjects.push({ name: repoName, url: repoUrl })
      }
    } else if (minViolations === fourSpaceViolations) {
      fourSpaceRepos++
      if (fourSpaceProjects.length < 5) {
        fourSpaceProjects.push({ name: repoName, url: repoUrl })
      }
    } else {
      tabRepos++
    }
  }

  const totalRepos = twoSpaceRepos + fourSpaceRepos + tabRepos + mixedRepos
  const spacesOnly = twoSpaceRepos + fourSpaceRepos

  return {
    totalRepos,
    twoSpaceRepos,
    fourSpaceRepos,
    tabRepos,
    mixedRepos,
    twoSpacePercent: spacesOnly > 0 ? Math.round((twoSpaceRepos / spacesOnly) * 100) : 0,
    fourSpacePercent: spacesOnly > 0 ? Math.round((fourSpaceRepos / spacesOnly) * 100) : 0,
    twoSpaceProjects,
    fourSpaceProjects,
  }
}

/**
 * Get spaces vs tabs statistics.
 * Spaces includes both 2-space and 4-space indentation.
 */
export function getSpacesVsTabsStats() {
  const results = getAnalysisResults().results

  let spacesRepos = 0
  let tabsRepos = 0
  let mixedRepos = 0

  const spacesProjects: { name: string; url: string }[] = []
  const tabsProjects: { name: string; url: string }[] = []

  for (const repo of results) {
    const indent = repo.checks["indent"]
    if (!indent) continue

    const twoSpaceViolations = indent["2-space"] ?? Infinity
    const fourSpaceViolations = indent["4-space"] ?? Infinity
    const tabViolations = indent["tab"] ?? Infinity

    // For spaces vs tabs, we combine 2-space and 4-space
    // The "spaces" violations = violations when expecting tabs (i.e., tabViolations)
    // The "tabs" violations = min of 2-space and 4-space violations

    const spacesViolations = Math.min(twoSpaceViolations, fourSpaceViolations)

    const repoUrl = `https://github.com/${repo.repoFullName}`
    const repoName = repo.repoFullName.split("/")[1] ?? repo.repoFullName

    // Check if there's a clear winner
    if (spacesViolations === 0 && tabViolations === 0) {
      mixedRepos++
    } else if (spacesViolations < tabViolations / 2) {
      spacesRepos++
      if (spacesProjects.length < 5) {
        spacesProjects.push({ name: repoName, url: repoUrl })
      }
    } else if (tabViolations < spacesViolations / 2) {
      tabsRepos++
      if (tabsProjects.length < 5) {
        tabsProjects.push({ name: repoName, url: repoUrl })
      }
    } else {
      mixedRepos++
    }
  }

  const totalRepos = spacesRepos + tabsRepos + mixedRepos
  const definiteRepos = spacesRepos + tabsRepos

  return {
    totalRepos,
    spacesRepos,
    tabsRepos,
    mixedRepos,
    spacesPercent: definiteRepos > 0 ? Math.round((spacesRepos / definiteRepos) * 100) : 0,
    tabsPercent: definiteRepos > 0 ? Math.round((tabsRepos / definiteRepos) * 100) : 0,
    spacesProjects,
    tabsProjects,
  }
}

/**
 * Get function style statistics (declaration vs expression/arrow)
 */
export function getFuncStyleStats() {
  const results = getAnalysisResults().results

  let declarationRepos = 0
  let expressionRepos = 0
  let mixedRepos = 0

  const declarationProjects: { name: string; url: string }[] = []
  const expressionProjects: { name: string; url: string }[] = []

  for (const repo of results) {
    const funcStyle = repo.checks["func-style"]
    if (!funcStyle) continue

    const expressionViolations = funcStyle["expression"] ?? 0
    const declarationViolations = funcStyle["declaration"] ?? 0

    const repoUrl = `https://github.com/${repo.repoFullName}`
    const repoName = repo.repoFullName.split("/")[1] ?? repo.repoFullName

    // If expression violations are high, they prefer declarations
    // If declaration violations are high, they prefer expressions/arrows
    if (expressionViolations === 0 && declarationViolations === 0) {
      mixedRepos++
    } else if (expressionViolations > declarationViolations * 2) {
      declarationRepos++
      if (declarationProjects.length < 5) {
        declarationProjects.push({ name: repoName, url: repoUrl })
      }
    } else if (declarationViolations > expressionViolations * 2) {
      expressionRepos++
      if (expressionProjects.length < 5) {
        expressionProjects.push({ name: repoName, url: repoUrl })
      }
    } else {
      mixedRepos++
    }
  }

  const totalRepos = declarationRepos + expressionRepos + mixedRepos

  return {
    totalRepos,
    declarationRepos,
    expressionRepos,
    mixedRepos,
    declarationPercent: totalRepos > 0 ? Math.round((declarationRepos / (declarationRepos + expressionRepos)) * 100) : 0,
    expressionPercent: totalRepos > 0 ? Math.round((expressionRepos / (declarationRepos + expressionRepos)) * 100) : 0,
    declarationProjects,
    expressionProjects,
  }
}
