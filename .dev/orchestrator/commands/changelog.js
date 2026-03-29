import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function changelog(version, summary) {
  try {
    console.log(chalk.cyan('\n--- Zuri: Changelog Update ---\n'))

    const root = process.cwd()
    const changelogDir = path.join(root, 'changelog')
    await fs.mkdir(changelogDir, { recursive: true })

    // Generate date in YYYYMMDD format
    const now = new Date()
    const dateYMD = now.toISOString().slice(0, 10).replace(/-/g, '')
    const dateISO = now.toISOString().slice(0, 10)

    // Scan for existing entries today to determine serial
    let serial = 1
    try {
      const files = await fs.readdir(changelogDir)
      const todayFiles = files.filter(
        (f) => f.startsWith(`CL-${dateYMD}-`) && f.endsWith('.md')
      )
      serial = todayFiles.length + 1
    } catch {
      // Dir might be empty
    }
    const paddedSerial = String(serial).padStart(3, '0')
    const entryId = `CL-${dateYMD}-${paddedSerial}`

    // Read changelog entry template
    const templatePath = path.join(__dirname, '..', 'templates', 'changelog-entry.md')
    let template = await fs.readFile(templatePath, 'utf-8')

    // Replace placeholders
    template = template.replace(/\{\{DATE\}\}/g, dateYMD)
    template = template.replace(/\{\{SERIAL\}\}/g, paddedSerial)
    template = template.replace(/\{\{VERSION\}\}/g, version)
    template = template.replace(/\{\{DATE_ISO\}\}/g, dateISO)

    // Inject summary
    template = template.replace(
      '<!-- 1-2 ประโยค -->',
      `<!-- 1-2 ประโยค -->\n${summary}`
    )

    // Write detailed entry file
    const entryPath = path.join(changelogDir, `${entryId}.md`)
    await fs.writeFile(entryPath, template, 'utf-8')
    console.log(chalk.green(`  Created: changelog/${entryId}.md`))

    // Update CHANGELOG.md
    const changelogMdPath = path.join(root, 'CHANGELOG.md')
    let changelogContent = ''
    try {
      changelogContent = await fs.readFile(changelogMdPath, 'utf-8')
    } catch {
      // Create initial CHANGELOG.md if it doesn't exist
      changelogContent = `# Changelog

> LATEST: (none)

## Recent

<!-- Recent changelog entries (max 5) -->

## Index

| Date | Version | Entry | Summary |
|------|---------|-------|---------|
`
      console.log(chalk.dim('  Created new CHANGELOG.md'))
    }

    // Update LATEST pointer
    const latestRegex = /^> LATEST:.*$/m
    if (latestRegex.test(changelogContent)) {
      changelogContent = changelogContent.replace(
        latestRegex,
        `> LATEST: ${entryId} (v${version})`
      )
    } else {
      // Insert LATEST after title
      changelogContent = changelogContent.replace(
        '# Changelog\n',
        `# Changelog\n\n> LATEST: ${entryId} (v${version})\n`
      )
    }

    // Add new entry to Recent section (right after "## Recent" heading)
    const newEntry = `- **${dateISO}** — v${version}: ${summary} → [${entryId}](changelog/${entryId}.md)`
    const recentHeadingRegex = /(## Recent\n(?:<!-- .*-->\n)?)/
    if (recentHeadingRegex.test(changelogContent)) {
      changelogContent = changelogContent.replace(recentHeadingRegex, `$1${newEntry}\n`)
    } else {
      // If no Recent section, add one
      changelogContent += `\n## Recent\n\n${newEntry}\n`
    }

    // Enforce max 5 entries in Recent: move oldest to Index
    const recentSectionMatch = changelogContent.match(
      /## Recent\n(?:<!-- .*-->\n)?((?:- \*\*.*\n)*)/
    )
    if (recentSectionMatch) {
      const recentLines = recentSectionMatch[1]
        .split('\n')
        .filter((l) => l.startsWith('- **'))

      if (recentLines.length > 5) {
        // Lines to move (everything after the 5th)
        const toKeep = recentLines.slice(0, 5)
        const toMove = recentLines.slice(5)

        // Replace recent entries with only the 5 most recent
        const recentBlock = recentSectionMatch[0]
        const newRecentBlock = recentBlock.replace(
          recentSectionMatch[1],
          toKeep.join('\n') + '\n'
        )
        changelogContent = changelogContent.replace(recentBlock, newRecentBlock)

        // Add moved entries to Index table
        for (const line of toMove) {
          // Parse: - **2026-03-28** — v1.0.0: summary → [CL-...](...)
          const parsed = line.match(
            /- \*\*(.+?)\*\* — v(.+?): (.+?) → \[(.+?)\]/
          )
          if (parsed) {
            const [, date, ver, sum, id] = parsed
            const indexRow = `| ${date} | v${ver} | [${id}](changelog/${id}.md) | ${sum} |`
            // Insert row after the Index table header
            const tableHeaderRegex = /(\| Date .+\|\n\|[-| ]+\|\n)/
            if (tableHeaderRegex.test(changelogContent)) {
              changelogContent = changelogContent.replace(
                tableHeaderRegex,
                `$1${indexRow}\n`
              )
            }
          }
        }
      }
    }

    await fs.writeFile(changelogMdPath, changelogContent, 'utf-8')
    console.log(chalk.green('  Updated: CHANGELOG.md'))
    console.log(chalk.yellow(`\n  Changelog updated — v${version}\n`))
  } catch (error) {
    console.error(chalk.red('[changelog]'), error.message)
    process.exitCode = 1
  }
}
