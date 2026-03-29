import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import matter from 'gray-matter'

export async function verifyFlow(specPath) {
  try {
    console.log(chalk.cyan('\n--- Zuri: Verify Feature Spec ---\n'))

    // Resolve spec path relative to cwd
    const fullPath = path.isAbsolute(specPath)
      ? specPath
      : path.join(process.cwd(), specPath)

    let content
    try {
      content = await fs.readFile(fullPath, 'utf-8')
    } catch {
      console.error(chalk.red(`  File not found: ${specPath}`))
      console.log(chalk.dim('  Hint: provide path relative to project root, e.g. docs/product/specs/FEAT-MY-FEATURE.md'))
      process.exitCode = 1
      return
    }

    // Parse frontmatter
    let parsed
    try {
      parsed = matter(content)
    } catch {
      console.error(chalk.red('  Failed to parse frontmatter'))
      process.exitCode = 1
      return
    }

    const { data: fm } = parsed
    const body = parsed.content

    const results = []
    let hasCriticalFail = false

    // --- Check 1: Required header fields (bold markdown style used in specs) ---
    // New spec format uses bold fields in body, not YAML frontmatter
    const hasStatus = /\*\*Status:\*\*/.test(body) || (fm.status && fm.status !== '')
    const hasAuthor = /\*\*Author:\*\*/.test(body) || (fm.author && fm.author !== '')
    const missingFields = []
    if (!hasStatus) missingFields.push('Status')
    if (!hasAuthor) missingFields.push('Author')
    if (missingFields.length === 0) {
      results.push({ label: 'Frontmatter', status: 'pass', detail: 'All required fields present' })
    } else {
      results.push({
        label: 'Frontmatter',
        status: 'fail',
        detail: `Missing: ${missingFields.join(', ')}`,
      })
      hasCriticalFail = true
    }

    // --- Check 2: Data Flow section ---
    if (/## 4\. Data Flow|## Data Flow/i.test(body)) {
      results.push({ label: 'Data Flow', status: 'pass', detail: 'Section found' })
    } else {
      results.push({ label: 'Data Flow', status: 'fail', detail: 'Missing' })
      hasCriticalFail = true
    }

    // --- Check 3: Feature Breakdown / Overview section ---
    if (/## 3\. Feature Breakdown|## 1\. Overview|## Feature Breakdown|## Overview/i.test(body)) {
      results.push({ label: 'Feature Breakdown / Overview', status: 'pass', detail: 'Section found' })
    } else {
      results.push({ label: 'Feature Breakdown / Overview', status: 'fail', detail: 'Missing' })
      hasCriticalFail = true
    }

    // --- Check 4: Roles & Permissions section ---
    if (/## 5\. Roles|## Roles\s*[&|and]*\s*Permissions/i.test(body)) {
      results.push({ label: 'Roles & Permissions', status: 'pass', detail: 'Section found' })
    } else {
      results.push({
        label: 'Roles & Permissions',
        status: 'warn',
        detail: 'No roles section defined',
      })
    }

    // --- Check 5: Schema changes → ADR reference ---
    const mentionsSchema =
      /schema|prisma|migration|model\s+\w+/i.test(body)
    if (mentionsSchema) {
      const adrRef = fm.adr
      const hasAdr =
        adrRef && ((Array.isArray(adrRef) && adrRef.length > 0) || (typeof adrRef === 'string' && adrRef.trim()))
      if (hasAdr) {
        const adrList = Array.isArray(adrRef) ? adrRef.join(', ') : adrRef
        results.push({
          label: 'Schema / ADR',
          status: 'pass',
          detail: `ADR referenced: ${adrList}`,
        })
      } else {
        results.push({
          label: 'Schema / ADR',
          status: 'fail',
          detail: 'Schema changes mentioned but no ADR referenced in frontmatter',
        })
        hasCriticalFail = true
      }
    } else {
      results.push({
        label: 'Schema / ADR',
        status: 'pass',
        detail: 'No schema changes detected',
      })
    }

    // --- Check 6: Status = APPROVED (support both frontmatter and bold body field) ---
    const bodyStatusMatch = body.match(/\*\*Status:\*\*\s*(\w+)/)
    const specStatus = fm.status || (bodyStatusMatch && bodyStatusMatch[1]) || 'UNKNOWN'
    if (specStatus === 'APPROVED') {
      results.push({ label: 'Status', status: 'pass', detail: 'APPROVED' })
    } else if (specStatus === 'REVIEW') {
      results.push({
        label: 'Status',
        status: 'warn',
        detail: `${specStatus} (needs approval)`,
      })
    } else {
      results.push({
        label: 'Status',
        status: 'fail',
        detail: `${specStatus} (needs approval)`,
      })
      hasCriticalFail = true
    }

    // --- Print results ---
    const icon = { pass: chalk.green('PASS'), fail: chalk.red('FAIL'), warn: chalk.yellow('WARN') }
    const sym = { pass: chalk.green('  +'), fail: chalk.red('  x'), warn: chalk.yellow('  !') }

    const overallPass = !hasCriticalFail
    console.log(
      overallPass
        ? chalk.green.bold('  PASS: Ready to implement')
        : chalk.red.bold('  FAIL: Not ready to implement')
    )
    console.log()

    for (const r of results) {
      console.log(`${sym[r.status]} ${r.label}: ${icon[r.status]} ${chalk.dim(r.detail)}`)
    }

    console.log()
    process.exitCode = overallPass ? 0 : 1
  } catch (error) {
    console.error(chalk.red('[verify-flow]'), error.message)
    process.exitCode = 1
  }
}
