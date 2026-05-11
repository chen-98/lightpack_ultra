# AGENT.md

## Role

You are an implementation agent working in this repository.

Default behavior:
- Make the smallest correct change.
- Do not perform unrelated refactors.
- Do not reformat unrelated files.
- Do not change public behavior unless the task explicitly requires it.
- Prefer existing project patterns over introducing new abstractions.
- Ask before adding new runtime dependencies.
- Keep changes reviewable as a small PR.
- Preserve compatibility with existing saved library JSON unless the task explicitly includes a migration.

## Project Context

This project is LighterPack, currently maintained on a Vue 2, Vuex, Express, and MongoDB baseline. The near-term direction is incremental modernization, not a full rewrite.

Key docs:
- `docs/architecture-notes.md`: system architecture, data boundaries, persistence, sharing, and migration path.
- `docs/decision-records.md`: accepted long-term product and engineering decisions.
- `docs/modernization-plan.md`: roadmap, current priorities, and completion criteria.
- `docs/product-philosophy.md`: product principles and requirement review checklist.
- `docs/working-agreement.md`: team workflow, documentation rules, and definition of done.
- `docs/change-log.md`: notable completed changes and verification notes.

Do not blindly modify these docs. Update them only when the change meets the documented update rules or the task explicitly asks for documentation changes.

## Required Context

Read the relevant docs before making non-trivial changes:

- When touching architecture, data models, persistence, API boundaries, routing, sharing, CSV output, or module boundaries, read:
  - `docs/architecture-notes.md`
  - `docs/decision-records.md`
- When working on modernization, migration, refactor, roadmap, or staged delivery tasks, read:
  - `docs/modernization-plan.md`
- When changing user-facing behavior, UX flow, feature scope, onboarding, sharing output, or product priorities, read:
  - `docs/product-philosophy.md`
- When unsure about process, documentation requirements, commit expectations, or definition of done, read:
  - `docs/working-agreement.md`
- When preparing a completed traceable code or product change, check whether `docs/change-log.md` needs a new entry under the working agreement.

If the task is trivial and isolated, use judgment and avoid unnecessary document churn.

## Task Discipline

Each agent thread should work on exactly one assigned task.

For every implementation task:
1. Restate the task in your own words.
2. Identify likely files to inspect.
3. Explain the planned change before editing.
4. Make the smallest implementation change.
5. Add or update tests when behavior changes.
6. Run the most relevant verification command.
7. After verification, prepare one focused commit for the completed task unless the user asks not to commit.
8. Finish with a summary:
   - files changed
   - behavior changed
   - tests run
   - commit created or why no commit was created
   - documentation updated or why no documentation update was needed
   - risks / follow-up

## Forbidden Unless Explicitly Requested

- Large rewrites
- Broad architectural changes
- Database migrations
- Dependency upgrades
- Lockfile changes
- Mass formatting
- Moving folders
- Renaming public APIs
- Changing CI configuration
- Editing unrelated TODOs

## Git and PR Expectations

- One task should become one branch / one PR.
- Keep commits focused: prefer one verified, reviewable commit per completed task.
- Do not create checkpoint commits for unfinished work unless the user explicitly asks for them.
- Prefer branch names like:
  - `codex/fix-<bug-name>`
  - `codex/add-<feature-name>`
  - `codex/refactor-<module-name>`
  - `codex/test-<module-name>`
- Commit messages should explain the change scope, purpose, and verification when the working agreement requires a traceable commit.

## Verification

Use project-specific commands where available.

Common commands:
- Unit tests: `npm run test:unit`
- Build and unit check: `npm run check`
- End-to-end tests: `npm run test:e2e`

At minimum, after code changes:
- Run the smallest relevant test first.
- Run `npm run check` when the task touches shared code, public APIs, data model behavior, persistence, sharing output, or user-facing workflows.
- If tests cannot be run, explain why and provide the exact command the user should run.

## Multi-Agent Safety

Assume other agents may be working in parallel.

Avoid editing high-conflict files unless the task requires it:
- `package.json`
- `package-lock.json`
- global config files
- shared types or data models
- shared validators
- database schema or persistence code
- central routing files
- global styling/theme files
- core documentation files under `docs/`

If the task needs one of these files, call it out clearly before editing.

Before editing, check the working tree and avoid overwriting unrelated user or agent changes. If existing changes affect your task, work with them instead of reverting them.
