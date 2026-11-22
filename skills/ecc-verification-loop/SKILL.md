<!-- SPDX-License-Identifier: MIT
     Adapted from affaan-m/ecc (v2.2.3, tag commit c05b2d6614f62f6db0047669aa4eefb223d478f9).
     Original: https://github.com/affaan-m/ecc — Copyright (c) 2026 Affaan Mustafa, MIT.
     Full license text in LICENSE in this folder. -->
---
name: ecc-verification-loop
description: Run a six-phase verification of a session's work — build, type check, lint, tests with coverage, security grep, and diff review — then produce a PASS/FAIL verification report. Use when verifying work after completing a feature or refactor, before creating a PR, or when quality gates must pass.
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim except the adaptations noted)

- **Source & license:** adapted from affaan-m/ecc, tag v2.2.3, commit `c05b2d66` (https://github.com/affaan-m/ecc), **MIT**, © Affaan Mustafa. Full license text in `LICENSE` in this folder. Adaptations stay MIT with this attribution.
- **SkillSpector 2026-11-22:** score **0/100 LOW, SAFE, 0 findings** on the upstream file. Nothing to override.
- **Muse, not Claude Code:** there is no `/verify` slash command and no PostToolUse hook in Muse. Invoke this skill by name, explicitly, after finishing work — it never auto-runs. The "Integration with Hooks" section below was rewritten accordingly.
- **Secrets in grep output:** Phase 5 greps the user's own project for secret-like strings. If a match looks like a real secret, report only file + line number — never paste the secret value into chat, a report, or a file.
- **Run only in the user's own project directory.** Never run the build/test/lint commands against a repo the user did not name.

# Verification Loop Skill

A comprehensive verification system for agent sessions (adapted from Claude Code to Muse).

## When to Use

Invoke this skill:
- After completing a feature or significant code change
- Before creating a PR
- When you want to ensure quality gates pass
- After refactoring

## Verification Phases

### Phase 1: Build Verification
```bash
# Check if project builds
npm run build 2>&1 | tail -20
# OR
pnpm build 2>&1 | tail -20
```

If build fails, STOP and fix before continuing.

### Phase 2: Type Check
```bash
set -o pipefail
# TypeScript projects
npx --no-install tsc --noEmit 2>&1 | head -30

# Python projects
pyright . 2>&1 | head -30
```

Report all type errors. Fix critical ones before continuing.

### Phase 3: Lint Check
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### Phase 4: Test Suite
```bash
# Run tests with coverage
npm run test -- --coverage 2>&1 | tail -50

# Check coverage threshold
# Target: 80% minimum
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Phase 5: Security Scan
```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Phase 6: Diff Review
```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

## Output Format

After running all phases, produce a verification report:

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
2. ...
```

## Continuous Mode

For long sessions, run verification every 15 minutes or after major changes:

```markdown
Set a mental checkpoint:
- After completing each function
- After finishing a component
- Before moving to next task

Invoke this skill by name to run a verification pass (there is no slash command in Muse).
```

## Integration with Hooks (adapted for Muse)

Upstream this skill complements PostToolUse hooks. Muse has no hook mechanism, so there is no automatic trigger: run this skill explicitly as a manual checklist after tool-heavy work or before a PR. Nothing here auto-runs.
