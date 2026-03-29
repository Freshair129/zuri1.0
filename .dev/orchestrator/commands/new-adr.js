import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function newAdr(title) {
  try {
    console.log(chalk.cyan('\n--- Zuri: New ADR ---\n'))

    // Scan existing ADRs to find highest number
    const adrDir = path.join(process.cwd(), 'docs', 'decisions', 'adrs')
    await fs.mkdir(adrDir, { recursive: true })

    let maxNumber = 67 // start from 068 if none found (ADR-067 is the current highest)
    try {
      const files = await fs.readdir(adrDir)
      const adrFiles = files.filter((f) => /^ADR-\d+/.test(f) && f.endsWith('.md'))
      for (const f of adrFiles) {
        const match = f.match(/ADR-(\d+)/)
        if (match) {
          const num = parseInt(match[1], 10)
          if (num > maxNumber) maxNumber = num
        }
      }
    } catch {
      // Directory might not exist yet — maxNumber stays 67
    }

    const nextNumber = maxNumber + 1
    const paddedNumber = String(nextNumber).padStart(3, '0')

    console.log(chalk.dim(`  Next ADR number: ADR-${paddedNumber}\n`))

    // Prompt for content
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'context',
        message: 'Context — what is the problem? Why do we need to decide?',
        default: '',
        waitForUseInput: false,
      },
      {
        type: 'input',
        name: 'decision',
        message: 'Decision — what was chosen and why?',
        validate: (v) => (v.trim() ? true : 'Decision is required'),
      },
      {
        type: 'input',
        name: 'consequences',
        message: 'Consequences — positive and negative impacts:',
        validate: (v) => (v.trim() ? true : 'Consequences are required'),
      },
    ])

    // Read template
    const templatePath = path.join(__dirname, '..', 'templates', 'adr.md')
    let template = await fs.readFile(templatePath, 'utf-8')

    const today = new Date().toISOString().slice(0, 10)
    const slug = slugify(title)

    // Replace placeholders
    template = template.replace(/\{\{NUMBER\}\}/g, paddedNumber)
    template = template.replace(/\{\{TITLE\}\}/g, title)
    template = template.replace(/\{\{DATE\}\}/g, today)

    // Inject context
    template = template.replace(
      '<!-- ปัญหาคืออะไร? ทำไมต้องตัดสินใจ? -->',
      `<!-- ปัญหาคืออะไร? ทำไมต้องตัดสินใจ? -->\n\n${answers.context}`
    )

    // Inject decision
    template = template.replace(
      '<!-- เลือกอะไร? ทำไม? -->',
      `<!-- เลือกอะไร? ทำไม? -->\n\n${answers.decision}`
    )

    // Inject consequences into Positive section
    template = template.replace(
      '### Positive\n- ...',
      `### Positive\n- ${answers.consequences}`
    )

    // Write ADR file
    const fileName = `ADR-${paddedNumber}-${slug}.md`
    const filePath = path.join(adrDir, fileName)
    await fs.writeFile(filePath, template, 'utf-8')

    console.log(chalk.green(`\n  Created: docs/decisions/adrs/${fileName}`))
    console.log(
      chalk.yellow(`  ADR-${paddedNumber} created — needs Boss approval\n`)
    )
  } catch (error) {
    console.error(chalk.red('[new-adr]'), error.message)
    process.exitCode = 1
  }
}
