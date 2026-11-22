<!-- SPDX-License-Identifier: MIT
     Adapted from affaan-m/ecc (v2.2.3, tag commit c05b2d6614f62f6db0047669aa4eefb223d478f9).
     Original: https://github.com/affaan-m/ecc — Copyright (c) 2026 Affaan Mustafa, MIT.
     Full license text in LICENSE in this folder. Helper scripts in scripts/ are MIT under the same attribution. -->
---
name: ecc-skill-stocktake
description: "Use when auditing Muse skills for quality. Supports Quick Scan (changed skills only) and Full Stocktake modes with sequential subagent batch evaluation."
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim except the adaptations noted)

- **Source & license:** adapted from affaan-m/ecc, tag v2.2.3, commit `c05b2d66` (https://github.com/affaan-m/ecc), **MIT**, © Affaan Mustafa. Full license text in `LICENSE` in this folder. Adaptations stay MIT with this attribution.
- **SkillSpector 2026-11-22:** score **14/100 LOW, CAUTION, 3 MEDIUM findings — ALL OVERRIDDEN with written reason.** All three are the same AS3 Skill Enumeration pattern (SKILL.md:50, :65, :182): the Quick Scan flow, the scan.sh call, and the results.json schema example all reference reading the skill estate. Enumerating the user's own skills is this skill's entire stated job — it runs only over the user's own `~/workspace/custom-skills/` to produce a local audit, with no exfiltration, no network, no credentials. The scanner's remediation (remove all skill-listing instructions) would delete the skill's entire job, so it is not applied. The three helper scripts were scanned as components and produced **zero findings** of their own (read in full: local-only `find`/`jq`/`node`/`date`, no network, no credential reads; the only write is `results.json`, which is the intended output). Full evidence in `~/workspace/skill-review/ecc-group1/REVIEW.md`.
- **Muse paths, not Claude Code:** every `~/.claude/skills/` in the upstream text means `~/workspace/custom-skills/` here; results live at `~/workspace/custom-skills/ecc-skill-stocktake/results.json`. There is no `/skill-stocktake` slash command in Muse — invoke this skill by name, and ask for a "full stocktake" for the full mode. Subagent batches run as Muse subagents (the orchestrating agent spawns them), not via the Claude Code `Agent()` tool call.
- **Scripts need `jq` + `node`** (both present in this VM, verified 2026-11-22). Script defaults were adapted to Muse paths (see scripts/ header notes). If `~/.claude/observations.jsonl` does not exist, usage counts are 0 — that is expected in Muse, not an error.
- **Retire / Merge / delete NEVER executes on its own.** Phase 4 requires presenting justification and getting the user's explicit confirmation first — for every file, every time. This skill only audits and proposes; it never deletes, archives, or edits another skill by itself.
- **Verdicts stay local:** reasons summarize defects in words; never paste another skill's full body or any secret into `results.json` or a report.

# skill-stocktake

Invoke by name (`ecc-skill-stocktake`) to audit all Muse skills using a quality checklist + AI holistic judgment. Supports two modes: Quick Scan for recently changed skills, and Full Stocktake for a complete review.

## Scope

The command targets the following paths **relative to the directory where it is invoked**:

| Path | Description |
|------|-------------|
| `~/workspace/custom-skills/` | Global skills (all projects) |
| `{cwd}/custom-skills/` | Project-level skills (if the directory exists) |

**At the start of Phase 1, the command explicitly lists which paths were found and scanned.**

### Targeting a specific project

To include project-level skills, run from that project's root directory:

```bash
cd ~/path/to/my-project
# then invoke ecc-skill-stocktake by name
```

If the project has no `custom-skills/` directory, only global skills are evaluated.

## Modes

| Mode | Trigger | Duration |
|------|---------|---------|
| Quick Scan | `results.json` exists (default) | 5–10 min |
| Full Stocktake | `results.json` absent, or a "full stocktake" was asked for | 20–30 min |

**Results cache:** `~/workspace/custom-skills/ecc-skill-stocktake/results.json`

## Quick Scan Flow

Re-evaluate only skills that have changed since the last run (5–10 min).

1. Read `~/workspace/custom-skills/ecc-skill-stocktake/results.json`
2. Run: `bash ~/workspace/custom-skills/ecc-skill-stocktake/scripts/quick-diff.sh \
         ~/workspace/custom-skills/ecc-skill-stocktake/results.json`
   (Project dir is NOT auto-detected in Muse; pass it explicitly if needed)
3. If output is `[]`: report "No changes since last run." and stop
4. Re-evaluate only those changed files using the same Phase 2 criteria
5. Carry forward unchanged skills from previous results
6. Output only the diff
7. Run: `bash ~/workspace/custom-skills/ecc-skill-stocktake/scripts/save-results.sh \
         ~/workspace/custom-skills/ecc-skill-stocktake/results.json <<< "$EVAL_RESULTS"`

## Full Stocktake Flow

### Phase 1 — Inventory

Run: `bash ~/workspace/custom-skills/ecc-skill-stocktake/scripts/scan.sh`

The script enumerates skill files, extracts frontmatter, and collects UTC mtimes.
Project dir is NOT auto-detected in Muse; pass it explicitly only if needed.
Present the scan summary and inventory table from the script output:

```
Scanning:
  ✓ ~/workspace/custom-skills/         (17 files)
  ✗ {cwd}/custom-skills/    (not found — global skills only)
```

| Skill | 7d use | 30d use | Description |
|-------|--------|---------|-------------|

### Phase 2 — Quality Evaluation

Ask the orchestrating agent to run a Muse subagent with the full inventory and checklist (upstream used the Claude Code `Agent()` tool call; in Muse the parent agent spawns the subagent with this prompt):

```text
Evaluate the following skill inventory against the checklist.

[INVENTORY]

[CHECKLIST]

Return JSON for each skill:
{ "verdict": "Keep"|"Improve"|"Update"|"Retire"|"Merge into [X]", "reason": "..." }
```

The subagent reads each skill, applies the checklist, and returns per-skill JSON:

`{ "verdict": "Keep"|"Improve"|"Update"|"Retire"|"Merge into [X]", "reason": "..." }`

**Chunk guidance:** Process ~20 skills per subagent invocation to keep context manageable. Save intermediate results to `results.json` (`status: "in_progress"`) after each chunk.

After all skills are evaluated: set `status: "completed"`, proceed to Phase 3.

**Resume detection:** If `status: "in_progress"` is found on startup, resume from the first unevaluated skill.

Each skill is evaluated against this checklist:

```
- [ ] Content overlap with other skills checked
- [ ] Overlap with MEMORY.md checked
- [ ] Freshness of technical references verified (use WebSearch if tool names / CLI flags / APIs are present)
- [ ] Usage frequency considered
```

Verdict criteria:

| Verdict | Meaning |
|---------|---------|
| Keep | Useful and current |
| Improve | Worth keeping, but specific improvements needed |
| Update | Referenced technology is outdated (verify with WebSearch) |
| Retire | Low quality, stale, or cost-asymmetric |
| Merge into [X] | Substantial overlap with another skill; name the merge target |

Evaluation is **holistic AI judgment** — not a numeric rubric. Guiding dimensions:
- **Actionability**: code examples, commands, or steps that let you act immediately
- **Scope fit**: name, trigger, and content are aligned; not too broad or narrow
- **Uniqueness**: value not replaceable by MEMORY.md / another skill
- **Currency**: technical references work in the current environment

**Reason quality requirements** — the `reason` field must be self-contained and decision-enabling:
- Do NOT write "unchanged" alone — always restate the core evidence
- For **Retire**: state (1) what specific defect was found, (2) what covers the same need instead
  - Bad: `"Superseded"`
  - Good: `"disable-model-invocation: true already set; superseded by continuous-learning-v2 which covers all the same patterns plus confidence scoring. No unique content remains."`
- For **Merge**: name the target and describe what content to integrate
  - Bad: `"Overlaps with X"`
  - Good: `"42-line thin content; Step 4 of chatlog-to-article already covers the same workflow. Integrate the 'article angle' tip as a note in that skill."`
- For **Improve**: describe the specific change needed (what section, what action, target size if relevant)
  - Bad: `"Too long"`
  - Good: `"276 lines; Section 'Framework Comparison' (L80–140) duplicates ai-era-architecture-principles; delete it to reach ~150 lines."`
- For **Keep** (mtime-only change in Quick Scan): restate the original verdict rationale, do not write "unchanged"
  - Bad: `"Unchanged"`
  - Good: `"mtime updated but content unchanged. Unique Python reference explicitly imported by rules/python/; no overlap found."`

### Phase 3 — Summary Table

| Skill | 7d use | Verdict | Reason |
|-------|--------|---------|--------|

### Phase 4 — Consolidation

1. **Retire / Merge**: present detailed justification per file before confirming with user:
   - What specific problem was found (overlap, staleness, broken references, etc.)
   - What alternative covers the same functionality (for Retire: which existing skill/rule; for Merge: the target file and what content to integrate)
   - Impact of removal (any dependent skills, MEMORY.md references, or workflows affected)
2. **Improve**: present specific improvement suggestions with rationale:
   - What to change and why (e.g., "trim 430→200 lines because sections X/Y duplicate python-patterns")
   - User decides whether to act
3. **Update**: present updated content with sources checked
4. Check MEMORY.md line count; propose compression if >100 lines

## Results File Schema

`~/workspace/custom-skills/ecc-skill-stocktake/results.json`:

**`evaluated_at`**: Must be set to the actual UTC time of evaluation completion.
Obtain via Bash: `date -u +%Y-%m-%dT%H:%M:%SZ`. Never use a date-only approximation like `T00:00:00Z`.

```json
{
  "evaluated_at": "2026-02-21T10:00:00Z",
  "mode": "full",
  "batch_progress": {
    "total": 80,
    "evaluated": 80,
    "status": "completed"
  },
  "skills": {
    "skill-name": {
      "path": "~/workspace/custom-skills/skill-name/SKILL.md",
      "verdict": "Keep",
      "reason": "Concrete, actionable, unique value for X workflow",
      "mtime": "2026-01-15T08:30:00Z"
    }
  }
}
```

## Notes

- Evaluation is blind: the same checklist applies to all skills regardless of origin (ECC, self-authored, auto-extracted)
- Archive / delete operations always require explicit user confirmation
- No verdict branching by skill origin
