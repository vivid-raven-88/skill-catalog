<!-- SPDX-License-Identifier: MIT
     Adapted from affaan-m/ecc (v2.2.3, commit 4adeee6732a12d1540f49a4d50a38ce8c97f9a53).
     Original: https://github.com/affaan-m/ecc — Copyright (c) 2026 Affaan Mustafa, MIT.
     Full license text in LICENSE in this folder. -->
---
name: ecc-search-first
description: "Research-before-coding workflow: search npm/PyPI, MCP servers, skills, and GitHub for existing tools before writing custom code, then adopt, extend, or build. Launches the researcher agent for non-trivial needs. Use when starting a feature, adding a dependency or integration, or about to write a utility that may already exist."
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim except the adaptations noted)

- **Source & license:** adapted from affaan-m/ecc, v2.2.3, commit `4adeee67` (https://github.com/affaan-m/ecc), **MIT**, © Affaan Mustafa. Full license text in `LICENSE` in this folder. Adaptations stay MIT with this attribution.
- **SkillSpector 2026-11-22:** score **38/100 MEDIUM, CAUTION, 3 findings** (1 HIGH + 2 MEDIUM) on the upstream file. Overridden with written reasons: two are false positives / intended behavior (enumerating the user's own skill catalog, and a phrase in an anti-pattern that forbids the flagged behavior), and one real light finding was mitigated — the upstream Quick Mode item that told the reader to check an agent settings file that can hold credentials was replaced with "check the MCP/connector tools available in this session; never read credential-bearing config files".
- **Muse, not Claude Code:** "launches the researcher agent" means delegating a research brief to a subagent when delegation is available, otherwise running the searches inline. There is no Claude Code agent-call syntax in Muse; the Full Mode block below was rewritten accordingly.
- **Search is read-only; installing is not.** Finding a package or skill is not installing it — `npm install`, skill installation, or adding any MCP/dependency still needs the Boss's explicit approval per item. Report honestly which search channels were skipped (never claim "nothing found" when a channel was unavailable). Never run an installer or setup wizard from a found package without review.
- **Do not relicense.** Any adaptation of this file stays MIT with attribution to Affaan Mustafa.

# /search-first — Research Before You Code

Systematizes the "search for existing solutions before implementing" workflow.

## Trigger

Use this skill when:

- Starting a new feature that likely has existing solutions
- Adding a dependency or integration
- The user asks "add X functionality" and you're about to write code
- Before creating a new utility, helper, or abstraction

## Workflow

```
┌─────────────────────────────────────────────┐
│  0. TOOL AVAILABILITY PREFLIGHT             │
│     Check search channels before relying on │
│     them; report skipped channels honestly   │
├─────────────────────────────────────────────┤
│  1. NEED ANALYSIS                           │
│     Define what functionality is needed      │
│     Identify language/framework constraints  │
├─────────────────────────────────────────────┤
│  2. PARALLEL SEARCH (researcher agent)      │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│     │  npm /   │ │  MCP /   │ │  GitHub / │  │
│     │  PyPI    │ │  Skills  │ │  Web      │  │
│     └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────┤
│  3. EVALUATE                                │
│     Score candidates (functionality, maint, │
│     community, docs, license, deps)         │
├─────────────────────────────────────────────┤
│  4. DECIDE                                  │
│     ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│     │  Adopt  │  │  Extend  │  │  Build   │  │
│     │  as-is  │  │  /Wrap   │  │  Custom  │  │
│     └─────────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────────┤
│  5. IMPLEMENT                               │
│     Install package / Configure MCP /       │
│     Write minimal custom code               │
└─────────────────────────────────────────────┘
```

## Decision Matrix

| Signal | Action |
|--------|--------|
| Exact match, well-maintained, MIT/Apache | **Adopt** — install and use directly |
| Partial match, good foundation | **Extend** — install + write thin wrapper |
| Multiple weak matches | **Compose** — combine 2-3 small packages |
| Nothing suitable found | **Build** — write custom, but informed by research |

## How to Use

### Step 0: Tool Availability Preflight

This is agent guidance, not an executable setup script. Check only the channels
that are relevant to the task and project in front of you.

| Channel | Check | If missing |
|---------|-------|------------|
| Repository search | `rg --files` and targeted `rg` queries | State that only visible files were inspected |
| Package registry | `npm --version`, `python -m pip --version`, or project package manager | Use web/docs search and avoid claiming registry coverage |
| GitHub CLI | `gh auth status` | Use public web or local git history only |
| MCP/docs tools | Available tool list or local MCP config | Fall back to official docs/web search |
| Skills directory | `ls ~/workspace/custom-skills` + skill search where applicable | Say no local skill catalog was available |

### Quick Mode (inline)

Before writing a utility or adding functionality, mentally run through:

0. Does this already exist in the repo? → `rg` through relevant modules/tests first
1. Is this a common problem? → Search npm/PyPI
2. Is there an MCP for this? → Check the MCP/connector tools available in this session; never read credential-bearing config files
3. Is there a skill for this? → Check `~/workspace/custom-skills/` via skill search
4. Is there a GitHub implementation/template? → Run GitHub code search for maintained OSS before writing net-new code

### Full Mode (agent)

For non-trivial functionality, delegate a research brief to a subagent when
delegation is available, otherwise run the searches inline. (Muse adaptation:
the upstream Claude Code agent-call block was replaced with this instruction.)

Research brief:

- Research existing tools for: [DESCRIPTION]
- Language/framework: [LANG]
- Constraints: [ANY]
- Search: npm/PyPI, MCP servers, skills, GitHub
- Return: Structured comparison with recommendation

## Search Shortcuts by Category

### Development Tooling

- Linting → `eslint`, `ruff`, `textlint`, `markdownlint`
- Formatting → `prettier`, `black`, `gofmt`
- Testing → `jest`, `pytest`, `go test`
- Pre-commit → `husky`, `lint-staged`, `pre-commit`

### AI/LLM Integration

- Claude SDK → Context7 for latest docs
- Prompt management → Check MCP servers
- Document processing → `unstructured`, `pdfplumber`, `mammoth`

### Data & APIs

- HTTP clients → `httpx` (Python), `ky`/`undici` (Node)
- Validation → `zod` (TS), `pydantic` (Python)
- Database → Check for MCP servers first

### Content & Publishing

- Markdown processing → `remark`, `unified`, `markdown-it`
- Image optimization → `sharp`, `imagemin`

## Integration Points

### With planner agent

The planner should invoke researcher before Phase 1 (Architecture Review):

- Researcher identifies available tools
- Planner incorporates them into the implementation plan
- Avoids "reinventing the wheel" in the plan

### With architect agent

The architect should consult researcher for:

- Technology stack decisions
- Integration pattern discovery
- Existing reference architectures

### With iterative-retrieval skill

Combine for progressive discovery:

- Cycle 1: Broad search (npm, PyPI, MCP)
- Cycle 2: Evaluate top candidates in detail
- Cycle 3: Test compatibility with project constraints

## Examples

### Example 1: "Add dead link checking"

```
Need: Check markdown files for broken links
Search: npm "markdown dead link checker"
Found: textlint-rule-no-dead-link (score: 9/10)
Action: ADOPT — npm install textlint-rule-no-dead-link
Result: Zero custom code, battle-tested solution
```

### Example 2: "Add HTTP client wrapper"

```
Need: Resilient HTTP client with retries and timeout handling
Search: npm "http client retry", PyPI "httpx retry"
Found: got (Node) with retry plugin, httpx (Python) with built-in retry
Action: ADOPT — use got/httpx directly with retry config
Result: Zero custom code, production-proven libraries
```

### Example 3: "Add config file linter"

```
Need: Validate project config files against a schema
Search: npm "config linter schema", "json schema validator cli"
Found: ajv-cli (score: 8/10)
Action: ADOPT + EXTEND — install ajv-cli, write project-specific schema
Result: 1 package + 1 schema file, no custom validation logic
```

## Anti-Patterns

- **Jumping to code**: Writing a utility without first searching for an existing one
- **Ignoring MCP**: Not checking if an MCP server already provides the capability
- **Silent skipping**: Reporting "nothing found" when a search channel was unavailable
- **Over-customizing**: Wrapping a library so heavily it loses its benefits
- **Dependency bloat**: Installing a massive package for one small feature
