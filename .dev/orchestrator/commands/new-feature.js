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

export async function newFeature(name) {
  try {
    console.log(chalk.cyan('\n--- Zuri: New Feature Spec ---\n'))

    // Prompt for module, description, priority
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'module',
        message: 'Select module:',
        choices: [
          'core/crm',
          'core/inbox',
          'core/pos',
          'core/marketing',
          'core/dsb',
          'core/tasks',
          'shared/auth',
          'shared/ai',
          'shared/multi-tenant',
          'shared/notifications',
          'shared/procurement',
          'industry/culinary/enrollment',
          'industry/culinary/kitchen',
        ],
      },
      {
        type: 'input',
        name: 'description',
        message: 'Short description:',
        validate: (v) => (v.trim() ? true : 'Description is required'),
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: ['P0', 'P1', 'P2', 'P3'],
        default: 'P1',
      },
    ])

    // Read template
    const templatePath = path.join(__dirname, '..', 'templates', 'feature-spec.md')
    let template = await fs.readFile(templatePath, 'utf-8')

    const today = new Date().toISOString().slice(0, 10)
    const slug = slugify(name)

    // Replace placeholders
    template = template.replace(/\{\{NAME\}\}/g, slug.toUpperCase())
    template = template.replace(/\{\{subtitle\}\}/g, answers.description)
    template = template.replace(/\{\{DATE\}\}/g, today)
    template = template.replace(/\{\{module\}\}/g, answers.module)

    // Inject description into Overview section placeholder
    template = template.replace(
      '<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->',
      `<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->\n${answers.description}`
    )

    // Write feature spec
    const specsDir = path.join(process.cwd(), 'docs', 'product', 'specs')
    await fs.mkdir(specsDir, { recursive: true })
    const featurePath = path.join(specsDir, `FEAT-${slug.toUpperCase()}.md`)
    await fs.writeFile(featurePath, template, 'utf-8')
    console.log(chalk.green(`  Created: docs/product/specs/FEAT-${slug.toUpperCase()}.md`))

    // Write flow skeleton
    const flowsDir = path.join(process.cwd(), 'docs', 'product', 'flows')
    await fs.mkdir(flowsDir, { recursive: true })
    const flowPath = path.join(flowsDir, `${slug}-flow.md`)
    const flowContent = `---
title: "${name} — Flow"
feature: "${slug}"
created: "${today}"
---

# ${name} — Flow

## User Flow

\`\`\`
[Start] --> [Step 1] --> [Step 2] --> [End]
\`\`\`

## Sequence Diagram

<!-- Add Mermaid or ASCII sequence diagram here -->

## Edge Cases

- ...
`
    await fs.writeFile(flowPath, flowContent, 'utf-8')
    console.log(chalk.green(`  Created: docs/product/flows/${slug}-flow.md`))

    console.log(
      chalk.yellow('\n  Feature spec created — review + approve before implement\n')
    )
  } catch (error) {
    console.error(chalk.red('[new-feature]'), error.message)
    process.exitCode = 1
  }
}
