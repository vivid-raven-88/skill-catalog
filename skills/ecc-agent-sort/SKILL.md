<!-- SPDX-License-Identifier: MIT
     Adapted from affaan-m/ecc (v2.2.3, tag commit c05b2d6614f62f6db0047669aa4eefb223d478f9).
     Original: https://github.com/affaan-m/ecc — Copyright (c) 2026 Affaan Mustafa, MIT.
     Full license text in LICENSE in this folder. -->
---
name: ecc-agent-sort
description: Build an evidence-backed install plan for a specific repo by sorting skills, commands, rules, hooks, and extras into DAILY vs LIBRARY buckets using parallel repo-aware review passes. Use when the skill surface should be trimmed to what a project actually needs instead of loading the full bundle.
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim except the adaptations noted)

- **Source & license:** adapted from affaan-m/ecc, tag v2.2.3, commit `c05b2d66` (https://github.com/affaan-m/ecc), **MIT**, © Affaan Mustafa. Full license text in `LICENSE` in this folder. Adaptations stay MIT with this attribution.
- **SkillSpector 2026-11-22:** score **8/100 LOW, SAFE, 1 MEDIUM finding — OVERRIDDEN with written reason.** The single finding (AS3 Skill Enumeration, SKILL.md:157) flags the instruction to create a `skill-library` router that lists library skills. That listing is this skill's stated purpose, and it runs only over the user's own skill estate in `~/workspace/custom-skills/` to produce a local install plan — no exfiltration, no network, no credentials, no secret access. The scanner's remediation (remove all skill-listing instructions) would delete the skill's entire job, so it is not applied. Guardrail: the router lists skill names + trigger keywords only — never copy a skill's body or any secret into the router or anywhere outside the workspace. Full evidence in `~/workspace/skill-review/ecc-group1/REVIEW.md`.
- **Muse paths, not Claude Code:** `.claude/skills/` in the upstream text means `~/workspace/custom-skills/` here. DAILY skills live there; there is no `.claude` install in Muse.
- **Hooks:** Muse has no hook mechanism. A DAILY hook in the upstream sense becomes a manual checklist item — never install a hook file pretending it auto-runs.
- **Handoffs:** only `ecc-skill-stocktake` (installed alongside this skill) is a real handoff target. `configure-ecc` and `strategic-compact` are NOT installed — do not invoke or invent them.
- **Repo layout:** upstream passes classify ECC repo dirs (`agents/`, `commands/`, `rules/`, `hooks/`). In Muse, map each pass to the matching dir if it exists in the target repo and skip passes whose dir does not exist — do not invent missing dirs.
- **No second install system:** keep the existing Muse `~/workspace/custom-skills/` layout; do not introduce another installer or plugin system.

# Agent Sort

Use this skill when a repo needs a project-specific skill surface instead of the default full install.

The goal is not to guess what "feels useful." The goal is to classify ECC components with evidence from the actual codebase.

## When to Use

- A project only needs a subset of ECC and full installs are too noisy
- The repo stack is clear, but nobody wants to hand-curate skills one by one
- A team wants a repeatable install decision backed by grep evidence instead of opinion
- You need to separate always-loaded daily workflow surfaces from searchable library/reference surfaces
- A repo has drifted into the wrong language, rule, or hook set and needs cleanup

## Non-Negotiable Rules

- Use the current repository as the source of truth, not generic preferences
- Every DAILY decision must cite concrete repo evidence
- LIBRARY does not mean "delete"; it means "keep accessible without loading by default"
- Do not install hooks, rules, or scripts that the current repo cannot use
- Prefer the existing Muse custom-skills layout; do not introduce a second install system

## Outputs

Produce these artifacts in order:

1. DAILY inventory
2. LIBRARY inventory
3. install plan
4. verification report
5. optional `skill-library` router if the project wants one

## Classification Model

Use two buckets only:

- `DAILY`
  - should load every session for this repo
  - strongly matched to the repo's language, framework, workflow, or operator surface
- `LIBRARY`
  - useful to retain, but not worth loading by default
  - should remain reachable through search, router skill, or selective manual use

## Evidence Sources

Use repo-local evidence before making any classification:

- file extensions
- package managers and lockfiles
- framework configs
- CI and hook configs
- build/test scripts
- imports and dependency manifests
- repo docs that explicitly describe the stack

Useful commands include:

```bash
rg --files
rg -n "typescript|react|next|supabase|django|spring|flutter|swift"
cat package.json
cat pyproject.toml
cat Cargo.toml
cat pubspec.yaml
cat go.mod
```

## Parallel Review Passes

If parallel subagents are available, split the review into these passes:

1. Agents
   - classify `agents/*`
2. Skills
   - classify `skills/*`
3. Commands
   - classify `commands/*`
4. Rules
   - classify `rules/*`
5. Hooks and scripts
   - classify hook surfaces, MCP health checks, helper scripts, and OS compatibility
6. Extras
   - classify contexts, examples, MCP configs, templates, and guidance docs

If subagents are not available, run the same passes sequentially.

## Core Workflow

### 1. Read the repo

Establish the real stack before classifying anything:

- languages in use
- frameworks in use
- primary package manager
- test stack
- lint/format stack
- deployment/runtime surface
- operator integrations already present

### 2. Build the evidence table

For every candidate surface, record:

- component path
- component type
- proposed bucket
- repo evidence
- short justification

Use this format:

```text
skills/frontend-patterns | skill | DAILY | 84 .tsx files, next.config.ts present | core frontend stack
skills/django-patterns   | skill | LIBRARY | no .py files, no pyproject.toml       | not active in this repo
rules/typescript/*       | rules | DAILY | package.json + tsconfig.json            | active TS repo
rules/python/*           | rules | LIBRARY | zero Python source files             | keep accessible only
```

### 3. Decide DAILY vs LIBRARY

Promote to `DAILY` when:

- the repo clearly uses the matching stack
- the component is general enough to help every session
- the repo already depends on the corresponding runtime or workflow

Demote to `LIBRARY` when:

- the component is off-stack
- the repo might need it later, but not every day
- it adds context overhead without immediate relevance

### 4. Build the install plan

Translate the classification into action:

- DAILY skills -> install or keep in `~/workspace/custom-skills/`
- DAILY commands -> keep as explicit shims only if still useful
- DAILY rules -> install only matching language sets
- DAILY hooks/scripts -> keep only compatible ones
- LIBRARY surfaces -> keep accessible through search or `skill-library`

If the repo already uses selective installs, update that plan instead of creating another system.

### 5. Create the optional library router

If the project wants a searchable library surface, create:

- `~/workspace/custom-skills/skill-library/SKILL.md` (create only if the user asks for a router)

That router should contain:

- a short explanation of DAILY vs LIBRARY
- grouped trigger keywords
- where the library references live

Do not duplicate every skill body inside the router.

### 6. Verify the result

After the plan is applied, verify:

- every DAILY file exists where expected
- stale language rules were not left active
- incompatible hooks were not installed
- the resulting install actually matches the repo stack

Return a compact report with:

- DAILY count
- LIBRARY count
- removed stale surfaces
- open questions

## Handoffs

If the next step is interactive installation or repair, that step needs a separate tool — `configure-ecc` is NOT installed in Muse, do not invoke it.

If the next step is overlap cleanup or catalog review, hand off to:

- `ecc-skill-stocktake`

If the next step is broader context trimming, note it as an open question — `strategic-compact` is NOT installed in Muse, do not invoke it.

## Output Format

Return the result in this order:

```text
STACK
- language/framework/runtime summary

DAILY
- always-loaded items with evidence

LIBRARY
- searchable/reference items with evidence

INSTALL PLAN
- what should be installed, removed, or routed

VERIFICATION
- checks run and remaining gaps
```
