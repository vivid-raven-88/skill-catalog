---
name: context7-docs
description: >-
  Fetch up-to-date, version-specific library documentation from Context7
  (upstash/context7) via the ctx7 CLI, on demand with npx. Use whenever the
  user asks about a specific library, framework, SDK, CLI tool, or cloud
  service — even well-known ones like React, Next.js, Prisma, or Express —
  because training data may not reflect recent API changes. Prefer this over
  web search for library documentation and API details.
---

# Context7 Docs (CLI mode)

Retrieve current documentation and code examples for any library using the
Context7 CLI. Source: upstash/context7 (MIT). Installed 2026-11-22 as a
combined skill from upstream `skills/find-docs/SKILL.md` +
`skills/context7-cli/SKILL.md` + `skills/context7-cli/references/docs.md`
(verbatim where kept); `references/setup.md` was deliberately NOT copied —
setup is out of scope for this skill, see Guardrails.

## Guardrails (binding, from the SkillSpector review 2026-11-22)

- **npx only, on demand.** Run `npx ctx7@latest …` per query. Never run
  `npm install -g ctx7`, never run `ctx7 setup` (it writes MCP config, rule
  files and skills into agent directories, and opens a browser for OAuth).
  Never use `ctx7 setup --yes` / `--skip-prompt` flags.
- **No key in chat, no login step.** Most commands work without login.
  If the free quota (1,000 calls/month) is exhausted, report it and fall
  back to training knowledge, clearly marked as possibly outdated. Only the
  user can do an OAuth login or create an API key (dashboard); a key, if
  ever provided, goes in an env var (`CONTEXT7_API_KEY`), never in chat.
- **No secrets in queries.** Never put API keys, passwords, credentials,
  personal data, or proprietary code in a `ctx7` query. Queries carry only
  the library name and the documentation question.
- **Max 3 attempts per question.** If the docs are not found after 3
  `library`/`docs` calls, use the best result so far and say so.
- **Quota is shared.** One resolve + one query per concept. Do not query
  per line of code. For small deterministic entries that do not depend on
  an external library, do not use Context7 at all.
- **Never set up or configure anything in the middle of a strict-transcript
  make.fun session.** Context7 use during a build is fine (it is just a
  docs query inside the recorded session); installation/configuration is
  not, because steps outside the recording can break the seal.
- **Not audit evidence.** Context7 docs are community-contributed and
  version-indexed, not a proof. For audit/bounty work, verify important
  claims against the source repo directly, and never cite Context7 as proof
  of a vulnerability — PoC + contract source remain the evidence.

## Workflow

Two-step process: resolve the library name to an ID, then query docs with
that ID. Full command reference: `references/docs.md`.

```bash
# Step 1: Resolve library ID (query is required — it affects ranking)
npx ctx7@latest library <name> "<query>"

# Step 2: Query documentation
npx ctx7@latest docs <libraryId> "<query>"
```

Call `library` first to obtain a valid library ID UNLESS the user
explicitly provides one in `/org/project` or `/org/project/version` format.

One-step search when no library ID is known (Context7 picks the libraries):

```bash
npx ctx7@latest search "<question>"
```

## Versions and language

If the user's project or question names a version, pass it with `--tag`
(e.g. `--tag 15.4.3`, or `--tag ^15.4.3` as written in package.json), even
when it is not listed — Context7 serves the indexed version that covers it.

```bash
npx ctx7@latest docs /vercel/next.js "How to set up app router" --tag 16.2.9
```

If the programming language is known, add `--language` so code examples in
that language rank first:

```bash
npx ctx7@latest docs /websites/twilio "How to send an SMS" --language Ruby
```

## Writing good queries

Be specific and keep each query to one topic — if the question spans
multiple distinct concepts, run a separate `docs` command per concept
instead of combining them, unless the question is about how the concepts
interact. Vague one-word queries return generic results.

| Quality | Example |
|---|---|
| Good | `"How to set up authentication with JWT in Express.js"` |
| Good | `"React useEffect cleanup function with async operations"` |
| Bad (too vague) | `"auth"` |
| Bad (too broad) | `"routing and auth and caching in Next.js"` |

The output contains **code snippets** (titled, language-tagged) and **info
snippets** (prose with breadcrumb context).

## Selection process (step 1 results)

1. Analyse the query to understand what library/package is wanted.
2. Select the most relevant match by name similarity (exact first),
   description relevance, documentation coverage (higher snippet counts),
   source reputation (High/Medium first), and benchmark score (100 max).
3. If several good matches exist, acknowledge it but proceed with the most
   relevant one. If none exist, say so and suggest query refinements.
4. For ambiguous queries, ask for clarification before best-guessing.

## Error handling

If a command fails with a quota error ("Monthly quota reached" or "quota
exceeded"):

1. Inform the user the Context7 quota is exhausted.
2. Suggest they authenticate for higher limits (a step only the user can
   do — never ask for a password, session token, or API key in chat).
3. If they cannot or choose not to authenticate, answer from training
   knowledge and clearly note it may be outdated.

Do not silently fall back to training data — always tell the user why
Context7 was not used.

## Common mistakes

- Library IDs require a `/` prefix — `/reactjs/react.dev`, not
  `reactjs/react.dev`.
- Always run `npx ctx7@latest library` first — `docs react "hooks"` fails
  without a valid ID.
- Use descriptive queries, not single words.
- One topic per query.
- Do not include sensitive information in queries.
