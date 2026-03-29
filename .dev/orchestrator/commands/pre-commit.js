import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { execSync } from 'child_process'

export async function preCommit() {
  try {
    console.log(chalk.cyan('\n--- Zuri: Pre-commit Checks ---\n'))

    const root = process.cwd()

    // Get staged files
    let stagedFiles = []
    try {
      const output = execSync('git diff --cached --name-only', {
        cwd: root,
        encoding: 'utf-8',
      })
      stagedFiles = output
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
    } catch {
      console.log(chalk.dim('  No git repository or no staged files found.'))
      process.exitCode = 0
      return
    }

    if (stagedFiles.length === 0) {
      console.log(chalk.dim('  No staged files to check.'))
      process.exitCode = 0
      return
    }

    console.log(chalk.dim(`  Checking ${stagedFiles.length} staged file(s)...\n`))

    const issues = [] // { level: 'block' | 'warn', message }

    // --- Check 1: schema.prisma staged → ADR required ---
    const schemaStaged = stagedFiles.some((f) => f.includes('prisma/schema.prisma'))
    if (schemaStaged) {
      issues.push({
        level: 'warn',
        message: 'prisma/schema.prisma is staged — ADR required for schema changes',
      })
    }

    // --- Check 2: .jsx files > 500 LOC ---
    const jsxFiles = stagedFiles.filter((f) => f.endsWith('.jsx'))
    for (const file of jsxFiles) {
      try {
        const fullPath = path.join(root, file)
        const content = await fs.readFile(fullPath, 'utf-8')
        const lineCount = content.split('\n').length
        if (lineCount > 500) {
          issues.push({
            level: 'warn',
            message: `${file} has ${lineCount} lines (> 500) — consider splitting`,
          })
        }
      } catch {
        // File might have been deleted in staging
      }
    }

    // --- Check 3: API routes should not contain getPrisma ---
    const apiFiles = stagedFiles.filter((f) => f.startsWith('src/app/api/'))
    for (const file of apiFiles) {
      try {
        const fullPath = path.join(root, file)
        const content = await fs.readFile(fullPath, 'utf-8')
        if (content.includes('getPrisma')) {
          issues.push({
            level: 'block',
            message: `${file} contains getPrisma() — use repository pattern instead`,
          })
        }
      } catch {
        // File might be deleted
      }
    }

    // --- Check 4: console.error without [ModuleName] pattern ---
    const codeFiles = stagedFiles.filter(
      (f) => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts')
    )
    for (const file of codeFiles) {
      try {
        const fullPath = path.join(root, file)
        const content = await fs.readFile(fullPath, 'utf-8')
        const lines = content.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          // Match console.error calls
          if (/console\.error\s*\(/.test(line)) {
            // Check if it has [ModuleName] pattern — either as string literal or template
            if (!/console\.error\s*\(\s*['"`]\[/.test(line)) {
              issues.push({
                level: 'warn',
                message: `${file}:${i + 1} — console.error missing [ModuleName] prefix`,
              })
            }
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    // --- Print results ---
    const blocks = issues.filter((i) => i.level === 'block')
    const warns = issues.filter((i) => i.level === 'warn')

    if (issues.length === 0) {
      console.log(chalk.green.bold('  PASS: All pre-commit checks passed\n'))
      process.exitCode = 0
      return
    }

    for (const issue of blocks) {
      console.log(chalk.red(`  x BLOCK: ${issue.message}`))
    }
    for (const issue of warns) {
      console.log(chalk.yellow(`  ! WARN:  ${issue.message}`))
    }
    console.log()

    if (blocks.length > 0) {
      console.log(
        chalk.red.bold(`  BLOCKED: ${blocks.length} issue(s) must be fixed before commit\n`)
      )
      process.exitCode = 1
    } else {
      console.log(
        chalk.yellow.bold(
          `  WARNING: ${warns.length} warning(s) — review before proceeding\n`
        )
      )
      process.exitCode = 2
    }
  } catch (error) {
    console.error(chalk.red('[pre-commit]'), error.message)
    process.exitCode = 1
  }
}
