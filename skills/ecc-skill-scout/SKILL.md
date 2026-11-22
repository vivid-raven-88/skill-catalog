<!-- SPDX-License-Identifier: MIT
     Adapted from affaan-m/ecc (v2.2.3, commit 4adeee6732a12d1540f49a4d50a38ce8c97f9a53).
     Original: https://github.com/affaan-m/ecc — Copyright (c) 2026 Affaan Mustafa, MIT.
     Full license text in LICENSE in this folder. -->
---
name: ecc-skill-scout
description: Search existing local, marketplace, GitHub, and web skill sources before creating a new skill. Use when the user wants to create, build, fork, or find a skill for a workflow. Muse adaptation: searches ~/workspace/custom-skills/ via skill search.
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim except the adaptations noted)

- **Source & license:** adapted from affaan-m/ecc, v2.2.3, commit `4adeee67` (https://github.com/affaan-m/ecc), **MIT**, © Affaan Mustafa. Full license text in `LICENSE` in this folder. Adaptations stay MIT with this attribution.
- **SkillSpector 2026-11-22:** score **40/100 MEDIUM, CAUTION, 3 findings** (2 HIGH + 1 MEDIUM) on the upstream file. All three are false positives / intended behavior, overridden with written reasons: the flagged findings describe listing the user's own installed skill catalog by name and frontmatter — which is the purpose of this skill — and the flagged paths were replaced by the Muse adaptation below, so the flagged patterns are gone from the installed file.
- **Muse, not Claude Code:** Step 2 below was adapted — local search uses skill search plus `~/workspace/custom-skills/`, not another agent's config directories. There is no marketplace plugin system in Muse.
- **Enumerate the user's own skill catalog ONLY.** Never read agent config directories or credential-bearing config files. An external skill found by this search may only be adopted after it passes the SkillSpector gate + semantic review (the same process as this install).
- **Do not relicense.** Any adaptation of this file stays MIT with attribution to Affaan Mustafa.

# Skill Scout

Use this skill before creating a new skill. The goal is to avoid duplicating
existing community or marketplace work, while still vetting anything external
before adoption.

Source: salvaged from stale community PR #1232 by `redminwang`.

## When to Use

- The user says "create a skill", "build a skill", "make a skill", or "new
  skill".
- The user asks "is there a skill for X?" or "does a skill exist that does Y?"
- The user describes a workflow and you are about to suggest creating a new
  skill.
- The user wants to fork or extend an existing skill.

If the user explicitly says to skip search or create from scratch, acknowledge
that and proceed with the requested creation workflow.

## How It Works

### Step 1 - Capture Intent

Extract:

- The task the skill should perform.
- The trigger conditions for using it.
- The domain, tools, frameworks, or data sources involved.
- Three to five search keywords plus useful synonyms.

### Step 2 - Search Local Sources

Search installed skill names first. Local sources are preferred
because they are already part of the user's environment.

In Muse, search the local catalog with skill search (keywords + synonyms),
then list `~/workspace/custom-skills/` to confirm names and frontmatter
descriptions. Do not search inside agent config directories or read
credential-bearing config files.

Then search frontmatter descriptions via skill search with the same
keywords and synonyms.

### Step 3 - Search Remote Sources

Use available GitHub and web search tools. Prefer concise queries:

```bash
gh search repos "claude code skill keyword" --limit 10 --sort stars
gh search code "name: keyword" --filename SKILL.md --limit 10
```

For web search, use at most three targeted queries such as:

```text
"claude code skill" keyword
"SKILL.md" keyword
"affaan-m/ECC" keyword
```

### Step 4 - Vet External Matches

Before recommending any external skill for adoption or forking:

- Read the `SKILL.md` frontmatter and instructions.
- Look for unexpected shell commands, file writes, network calls, credential
  handling, or package installs.
- Check whether the repository appears maintained.
- Prefer copying into a fresh local branch and reviewing the diff over editing
  marketplace originals.

### Step 5 - Rank Results

Rank candidates by:

1. Exact keyword match in the skill name.
2. Keyword or synonym match in description.
3. Local installed or marketplace source.
4. Maintained GitHub source with recent activity.
5. Web-only mention.

Cap the final list at 10 results.

### Step 6 - Present Decision Options

Give the user a short table:

| Option | Meaning |
| --- | --- |
| Use existing | Invoke or install a matching skill as-is. |
| Fork or extend | Copy the closest skill and modify it. |
| Create fresh | Build a new skill after confirming no close match exists. |

Only create a new skill after the user chooses that path or after the search
finds no close match.

## Examples

### Result Table

```markdown
| # | Skill | Source | Why it matches | Gap |
| --- | --- | --- | --- | --- |
| 1 | article-writing | Local ECC | Drafts articles and guides | Not focused on release notes |
| 2 | content-engine | Local ECC | Multi-format content workflow | Heavier than needed |
| 3 | blog-writer | GitHub | Blog writing skill with recent commits | Needs security review |
```

### User-Facing Summary

```markdown
I found two close local matches and one external candidate. The closest fit is
`article-writing`; it covers drafting and revision, but it does not include the
release-note checklist you asked for. I can either use it as-is, fork it into a
release-note variant, or create a fresh skill.
```

## Anti-Patterns

- Do not jump directly to new skill creation when a search is reasonable.
- Do not install external skills without reading them first.
- Do not present a long unranked list of weak matches.
- Do not treat web-only mentions as trusted sources.
- Do not edit installed marketplace originals in place.

## Related

- `search-first` - General search-before-building workflow.
- `skill-stocktake` - Audit installed skills for health, duplicates, and gaps.
- `agent-sort` - Categorize and organize existing agents and skills.
