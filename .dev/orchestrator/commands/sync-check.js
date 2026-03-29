import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import matter from 'gray-matter'

export async function syncCheck() {
  try {
    console.log(chalk.cyan('\n--- Zuri: Sync Check (Docs Integrity) ---\n'))

    const root = process.cwd()
    const issues = []
    let adrCount = 0
    let featureCount = 0

    // --- Check 1: ADRs have valid frontmatter ---
    const adrDir = path.join(root, 'docs', 'adr')
    try {
      const adrFiles = (await fs.readdir(adrDir)).filter(
        (f) => /^ADR-\d+/.test(f) && f.endsWith('.md')
      )
      adrCount = adrFiles.length

      for (const file of adrFiles) {
        const filePath = path.join(adrDir, file)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const { data: fm } = matter(content)

          const missing = []
          if (!fm.adr && !fm.title) missing.push('title')
          if (!fm.status) missing.push('status')
          if (!fm.date) missing.push('date')

          if (missing.length > 0) {
            issues.push({
              type: 'adr',
              file,
              message: `Missing frontmatter: ${missing.join(', ')}`,
            })
          }
        } catch (err) {
          issues.push({
            type: 'adr',
            file,
            message: `Failed to parse: ${err.message}`,
          })
        }
      }
    } catch {
      issues.push({
        type: 'adr',
        file: 'docs/adr/',
        message: 'Directory not found',
      })
    }

    // --- Check 2: Feature specs have status field ---
    const featuresDir = path.join(root, 'docs', 'product', 'features')
    try {
      const featureFiles = (await fs.readdir(featuresDir)).filter((f) =>
        f.endsWith('.md')
      )
      featureCount = featureFiles.length

      for (const file of featureFiles) {
        const filePath = path.join(featuresDir, file)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const { data: fm } = matter(content)

          if (!fm.status) {
            issues.push({
              type: 'feature',
              file,
              message: 'Missing status field in frontmatter',
            })
          }
        } catch (err) {
          issues.push({
            type: 'feature',
            file,
            message: `Failed to parse: ${err.message}`,
          })
        }
      }
    } catch {
      issues.push({
        type: 'feature',
        file: 'docs/product/features/',
        message: 'Directory not found',
      })
    }

    // --- Check 3: CHANGELOG.md LATEST pointer matches a real file ---
    const changelogPath = path.join(root, 'CHANGELOG.md')
    try {
      const changelogContent = await fs.readFile(changelogPath, 'utf-8')
      const latestMatch = changelogContent.match(/^> LATEST:\s*(CL-\d{8}-\d{3})/m)

      if (latestMatch) {
        const latestId = latestMatch[1]
        const latestFile = path.join(root, 'changelog', `${latestId}.md`)
        try {
          await fs.access(latestFile)
          // File exists — good
        } catch {
          issues.push({
            type: 'changelog',
            file: 'CHANGELOG.md',
            message: `LATEST points to ${latestId} but changelog/${latestId}.md not found`,
          })
        }
      } else {
        issues.push({
          type: 'changelog',
          file: 'CHANGELOG.md',
          message: 'No LATEST pointer found (expected "> LATEST: CL-YYYYMMDD-NNN")',
        })
      }
    } catch {
      issues.push({
        type: 'changelog',
        file: 'CHANGELOG.md',
        message: 'File not found',
      })
    }

    // --- Print summary ---
    console.log(chalk.bold('  Totals:'))
    console.log(`    ADRs found:     ${adrCount}`)
    console.log(`    Features found: ${featureCount}`)
    console.log(`    Issues:         ${issues.length}`)
    console.log()

    if (issues.length === 0) {
      console.log(chalk.green.bold('  All checks passed — docs are in sync\n'))
    } else {
      console.log(chalk.yellow.bold('  Issues found:\n'))
      for (const issue of issues) {
        const tag = chalk.dim(`[${issue.type}]`)
        console.log(chalk.yellow(`    ! ${tag} ${issue.file}: ${issue.message}`))
      }
      console.log()
    }

    process.exitCode = issues.length > 0 ? 1 : 0
  } catch (error) {
    console.error(chalk.red('[sync-check]'), error.message)
    process.exitCode = 1
  }
}
