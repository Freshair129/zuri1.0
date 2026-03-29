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
          'core/inbox',
          'core/crm',
          'core/pos',
          'core/marketing',
          'core/tasks',
          'core/ai',
          'shared/inventory',
          'shared/procurement',
          'industry/culinary/courses',
          'industry/culinary/enrollment',
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
    template = template.replace(/\{\{NAME\}\}/g, name)
    template = template.replace(/\{\{DATE\}\}/g, today)
    template = template.replace(/\{\{module\}\}/g, answers.module)

    // Update priority in frontmatter
    template = template.replace(/priority: P1/, `priority: ${answers.priority}`)

    // Insert description into Summary section
    template = template.replace(
      '<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->',
      `<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->\n${answers.description}`
    )

    // Fix the module line in frontmatter (template has core/{{module}})
    template = template.replace(`core/${answers.module}`, answers.module)

    // Write feature spec
    const featuresDir = path.join(process.cwd(), 'docs', 'product', 'features')
    await fs.mkdir(featuresDir, { recursive: true })
    const featurePath = path.join(featuresDir, `${slug}.md`)
    await fs.writeFile(featurePath, template, 'utf-8')
    console.log(chalk.green(`  Created: docs/product/features/${slug}.md`))

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
