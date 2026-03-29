#!/usr/bin/env node

/**
 * Zuri Orchestrator CLI
 * Enforce DOC TO CODE workflow
 *
 * Usage:
 *   npx zuri new-feature <name>
 *   npx zuri new-adr <title>
 *   npx zuri changelog <version> <summary>
 *   npx zuri verify-flow <spec-path>
 *   npx zuri pre-commit
 *   npx zuri sync-check
 */

import { Command } from 'commander'
import chalk from 'chalk'

const program = new Command()

program
  .name('zuri')
  .description('Zuri Platform — DOC TO CODE Orchestrator')
  .version('1.0.0')

// ─── Commands ──────────────────────────────────────────────

program
  .command('new-feature <name>')
  .description(
    'Create a feature spec → docs/product/specs/FEAT-{SLUG}.md\n' +
    '  Modules: core/crm, core/inbox, core/pos, core/marketing, core/dsb, core/tasks\n' +
    '           shared/auth, shared/ai, shared/multi-tenant, shared/notifications, shared/procurement\n' +
    '           industry/culinary/enrollment, industry/culinary/kitchen'
  )
  .action(async (name) => {
    const { newFeature } = await import('./commands/new-feature.js')
    await newFeature(name)
  })

program
  .command('new-adr <title>')
  .description('Create an ADR → docs/decisions/adrs/ADR-{NNN}-{slug}.md (auto-numbered after ADR-067)')
  .action(async (title) => {
    const { newAdr } = await import('./commands/new-adr.js')
    await newAdr(title)
  })

program
  .command('changelog <version> <summary>')
  .description('Add changelog entry (sliding window)')
  .action(async (version, summary) => {
    const { changelog } = await import('./commands/changelog.js')
    await changelog(version, summary)
  })

program
  .command('verify-flow <specPath>')
  .description('Verify feature spec completeness before implement (e.g. docs/product/specs/FEAT-MY-FEATURE.md)')
  .action(async (specPath) => {
    const { verifyFlow } = await import('./commands/verify-flow.js')
    await verifyFlow(specPath)
  })

program
  .command('pre-commit')
  .description('Pre-commit checks (DOC TO CODE enforcement)')
  .action(async () => {
    const { preCommit } = await import('./commands/pre-commit.js')
    await preCommit()
  })

program
  .command('sync-check')
  .description('Verify docs/ SSOT integrity')
  .action(async () => {
    const { syncCheck } = await import('./commands/sync-check.js')
    await syncCheck()
  })

program.parse()
