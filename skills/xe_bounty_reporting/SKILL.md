# XE Bounty Reporting

## Check duplicates before drafting

- Search the board at https://bounty.xe.network/ in the live browser before you write any draft.

- Compare tickets by symptom and mechanism, not by title alone, and record why each checked ticket differs.

- Skip XE-5819 for the chat send envelope mismatch and XE-3445 and XE-3065 for lease hours counting seconds.

- Never draft first and check later, since that produced duplicate drafts in the 2026-11-12 marathon.

## Verify the finding on testnet

- Reproduce the finding with a control case that should behave normally, and capture the request, response and state before and after.

- Call a finding a race condition only when one run fails and a matching control run succeeds.

- Check the official tiers at test.network/bounty before naming a severity, since social posts list wrong figures.

- Use Critical up to 50000 XE, Severe up to 25000 XE, High up to 10000 XE, Medium up to 2500 XE and Minor up to 650 XE, and name the lowest tier Minor, never Low.

## Run the 7-Question Gate before drafting

Adapted from Agentic Bug Hunter's triage-validation skill. Ask in order.
One wrong answer = STOP, kill the finding, move on. Never draft a finding
that fails the gate.

- Q1 — Can an attacker reproduce this RIGHT NOW, step by step? Fill the
  template: setup (own test wallet / another user's address / no account),
  exact request (endpoint + method + params, copy-paste ready), exact
  response and state, real impact, cost (time + funds). If step 2 cannot
  be written as a real request → KILL IT.
- XE hard rule from F-10 / XE-8274 (false positive): a `GET /blocks`
  returning 200 does NOT mean finalized. Q1 is only satisfied when the
  `finalized` field, the canonical chain, and the recipient's pending set
  are all checked. Never equate "block exists" with "finalized".
- Q2 — Is the impact on the program's accepted list? Check the official
  tiers at test.network/bounty (Critical up to 50,000 XE, Severe up to
  25,000 XE, High up to 10,000 XE, Medium up to 2,500 XE, Minor up to
  650 XE). If the bug class is excluded there → KILL IT.
- Q3 — Is the root cause in an in-scope asset? XE scope is everything on
  testnet (testnet-0005). Out of scope → KILL IT.
- Q4 — Does it require privileged access an attacker can't realistically
  get? "Admin / operator can do X" is a centralization risk → KILL IT.
  Valid form: "non-admin can do X that only admin should do".
- Q5 — Is this already known or accepted behavior? Check the live board,
  disclosed reports, the repo's issues and changelog, and the docs. If it
  is a documented design decision → KILL IT. This is the duplicate check
  above — do it before drafting, never after.
- Q6 — Can you prove impact beyond "technically possible"? A 200 status,
  an error string, or a theoretical path is not proof. Show the real
  effect: funds moved or stuck, finality stalled with measured lag, a
  page that never renders, another account's data in the response. If the
  proof is only "technically possible" → DOWNGRADE the tier, do not kill.
- Q7 — Is this a known-invalid class for XE? Check the never-submit list
  below. On the list without a chain → KILL IT.
- Q8 — Identity check, for auth findings only (chat, directory, multisig,
  keyset). Record which identity found it (alice / bob / SDK wallet /
  anonymous) and re-run under a second identity and with no auth. A finding
  that only reproduces under one identity is often a legitimate permission
  boundary, not a bug. Blank answers mean unproven for auth findings.

Never-submit list for XE — do not draft these; a comment on the existing
ticket is allowed only when it adds a root cause:
- F-2 / XE-5819 — CLI chat send envelope mismatch
- F-9 / XE-3445 + XE-3065 — reputation lease_hours counting seconds
- XE-5310 — received XE shows SPENDABLE 0 after claim (stale display)
- XE-7345 — pending-receives time column always "—"
- XE-7405 — history shows amount "–" for receives
- XE-5824 — web wallet caches vault passphrase in sessionStorage
- XE-7639 — web-wallet faucet hang (button stuck on "requesting…")
- XCU asset issue — XE-5905 + XE-3841
- keygen trailing-args — XE-7347

## Run the 4 pre-submission gates

All four must pass, in order, before the draft is written.

- Gate 0 — Reality Check (30 seconds): the bug is real (real requests,
  not code reading alone), in scope, reproducible from a fresh session,
  evidence ready.
- Gate 1 — Impact Validation (2 minutes): answer "what can an attacker do
  that they couldn't before?" with a real victim — another user's funds
  or data, network finality, a broken page — not "see non-sensitive data".
- Gate 2 — Deduplication (5 minutes): board search by symptom AND
  mechanism, most recent disclosed reports read, not a known issue in the
  changelog or docs.
- Gate 3 — Report Quality (10 minutes): Summary-first, short,
  copy-pasteable reproduction, evidence shows real impact, no "Suggested
  tier" and no "Attachments" section, no payout address in the body, never
  write "could potentially" or "may allow".

## Kill fast

- 5-minute rule: if Q1's template can't be filled in 5 minutes → move on.
- More than 2 preconditions at once → kill it.
- 30+ minutes on Q6 with no reproducible proof → kill it.
- 20-minute rotation: stuck on one surface for 20 minutes → switch
  surface and come back later.
- One bug = one draft. Never file two independent findings in one report.

## Draft a short Summary-first report

- Open with a short Summary that states the bug and its impact, and keep the draft minimal.

- Leave out any Suggested tier section and any Attachments section unless the user asks for them.

- Leave the payout address out of every report body, since the user fills the wallet field in the desk form.

- Give the draft to the user as copy-paste text and let the user file the ticket.

## File a pre-report before a volume campaign

- File a short report before any sustained load campaign so the team can watch it and attribute the results to the user.

- Expect sealed tickets to return a public 404 until the team reads them, and recheck after about 24 hours.

## Available connectors

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Websites

- [XE bounty board](https://bounty.xe.network/) for searching tickets and checking duplicates. Carry the symptom and mechanism into `browser.browse` and verify the matching tickets there.

## Alternatives for better results

- Disclose related prior art in the draft when a finding shares a mechanism with an earlier ticket.
