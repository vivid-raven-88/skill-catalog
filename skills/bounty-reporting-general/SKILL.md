---
name: bounty-reporting-general
description: Program-agnostic bug bounty reporting: check duplicates by mechanism before drafting, reproduce with a control case, run the 7-Question Gate, and write a short Summary-first report. Adapted from the XE Network reporting workflow, with all program-specific values (board URL, tiers, scope, never-submit list) as inputs, not hard-coded.
---

# Bounty Reporting (General)

A program-agnostic version of the XE Network reporting workflow. The method is
the same; every program-specific value is an input you fill in before you
start, never a hard-coded fact. Do not draft anything until the program
profile below is filled in.

## Program profile — fill in first

Before any finding is drafted, record:

- **Board / disclosure list:** where public tickets live (URL).
- **Scope:** exactly which assets are in scope (repo, contracts, testnet, endpoints).
- **Severity tiers:** the program's official table, copied from its own page — never from a social post or memory.
- **Submission channel:** form, email, or platform, and what it asks for (PoC required? attachments allowed?).
- **Payout field:** where the payout address goes. It never goes in the draft body — the user fills it in the program's form.
- **Never-submit list:** the program's known-invalid classes, if any.

If any of these is unknown, look it up on the program's own page before drafting.

## Check duplicates before drafting

- Search the program's public board in the live browser before you write any draft.
- Compare tickets by symptom and mechanism, not by title alone, and record why each checked ticket differs.
- Never draft first and check later — that is how duplicate drafts happen.
- Partial overlap = hold. Doubt = hold. "Not found in the list I checked" is not proof: sealed or private reports are a blind spot, say so in the draft note.

## Verify the finding

- Reproduce the finding with a control case that should behave normally, and capture the request, response and state before and after.
- Call a finding a race condition only when one run fails and a matching control run succeeds.
- Check the official tier table before naming a severity.
- Never equate a success signal with the claimed state. A `200` response, a "block exists" reply, or a transaction hash is not proof of the effect — check the actual state field the claim depends on (finalized flag, canonical chain, recipient balance, rendered page). This is the generalized form of the XE F-10 lesson.

## Run the 7-Question Gate before drafting

Ask in order. One wrong answer = STOP, kill the finding, move on. Never draft
a finding that fails the gate.

- Q1 — Can an attacker reproduce this RIGHT NOW, step by step? Fill the template: setup, exact request (endpoint + method + params, copy-paste ready), exact response and state, real impact, cost (time + funds). If the request cannot be written as a real request → KILL IT.
- Q2 — Is the impact on the program's accepted list? Check the official tier table from the program profile. If the bug class is excluded → KILL IT.
- Q3 — Is the root cause in an in-scope asset? Out of scope → KILL IT.
- Q4 — Does it require privileged access an attacker can't realistically get? "Admin / operator can do X" is a centralization risk → KILL IT. Valid form: "non-admin can do X that only admin should do".
- Q5 — Is this already known or accepted behavior? Check the live board, disclosed reports, the repo's issues and changelog, and the docs. If it is a documented design decision → KILL IT. This is the duplicate check above — do it before drafting, never after.
- Q6 — Can you prove impact beyond "technically possible"? A 200 status, an error string, or a theoretical path is not proof. Show the real effect: funds moved or stuck, finality stalled with measured lag, a page that never renders, another account's data in the response. If the proof is only "technically possible" → DOWNGRADE the tier, do not kill.
- Q7 — Is this a known-invalid class for this program? Check the program profile's never-submit list. On the list without a chain → KILL IT.
- Q8 — Identity check, for auth findings only. Record which identity found it and re-run under a second identity and with no auth. A finding that only reproduces under one identity is often a legitimate permission boundary, not a bug. Blank answers mean unproven for auth findings.

## Run the 4 pre-submission gates

All four must pass, in order, before the draft is written.

- Gate 0 — Reality Check (30 seconds): the bug is real (real requests, not code reading alone), in scope, reproducible from a fresh session, evidence ready.
- Gate 1 — Impact Validation (2 minutes): answer "what can an attacker do that they couldn't before?" with a real victim — another user's funds or data, network finality, a broken page — not "see non-sensitive data".
- Gate 2 — Deduplication (5 minutes): board search by symptom AND mechanism, most recent disclosed reports read, not a known issue in the changelog or docs.
- Gate 3 — Report Quality (10 minutes): Summary-first, short, copy-pasteable reproduction, evidence shows real impact, no "Suggested tier" and no "Attachments" section unless the user asks, no payout address in the body, never write "could potentially" or "may allow".

## Kill fast

- 5-minute rule: if Q1's template can't be filled in 5 minutes → move on.
- More than 2 preconditions at once → kill it.
- 30+ minutes on Q6 with no reproducible proof → kill it.
- 20-minute rotation: stuck on one surface for 20 minutes → switch surface and come back later.
- One bug = one draft. Never file two independent findings in one report.

## Draft a short Summary-first report

- Open with a short Summary that states the bug and its impact, and keep the draft minimal.
- Leave out any Suggested tier section and any Attachments section unless the user asks for them.
- Leave the payout address out of every report body — the user fills it in the program's form.
- Give the draft to the user as copy-paste text and let the user file it.

## File a pre-report before a volume campaign

- File a short report before any sustained load campaign so the team can watch it and attribute the results to the user.
- Expect sealed tickets to return a public 404 until the team reads them, and recheck after about 24 hours.

## Worked example — XE Network, ticket XE-14109 (filed, Minor)

This is a real finding, used here to show how the workflow runs end to end.
Values are the program profile for XE; for another program, only the profile
changes.

### Program profile (XE)

- **Board:** https://bounty.xe.network/
- **Scope:** everything on testnet (testnet-0005).
- **Tiers:** Critical ≤ 50,000 XE, Severe ≤ 25,000, High ≤ 10,000, Medium ≤ 2,500, Minor ≤ 650 (lowest tier is Minor, never Low).
- **Submission channel:** report form on the board; the user fills the payout wallet field in the form.
- **Never-submit list:** the XE list in the original skill (XE-5819, XE-3445, XE-3065, XE-5310, XE-7345, XE-7405, XE-5824, XE-7639, XE-5905, XE-7347).

### The finding

The Explorer lease page labels amounts "cost (XCU)" and "stake (XCU)", but the
numbers shown are actually micro-XUSD — a different unit. A user reading the
label will misjudge the real cost by the XCU/XUSD rate.

### Gate walk-through

- **Q1 (reproduce now):** PASS — open any lease on the Explorer, read the label and the number, compare against the on-chain lease quote in micro-XUSD. Copy-pasteable: the lease page URL + the API quote.
- **Q2 (accepted impact):** PASS — wrong-unit display is an accepted Minor-class issue on the board.
- **Q3 (in scope):** PASS — the Explorer is part of the testnet surface.
- **Q4 (no unrealistic privilege):** PASS — any visitor can see it, no admin needed.
- **Q5 (not known/accepted):** PASS — board searched by symptom ("lease label") and mechanism ("unit mismatch"); no matching ticket, no doc stating the label is intentional.
- **Q6 (prove impact):** PASS — the screenshot + quote show the mismatch directly; the impact is a user misreading the cost, which is why this is Minor, not higher.
- **Q7 (not a known-invalid class):** PASS — not on the never-submit list.
- **Q8 (identity):** not applicable — no auth involved.

### The draft that was filed (Summary-first, short)

> **Summary:** The Explorer lease page labels amounts "cost (XCU)" and "stake (XCU)", but the values are micro-XUSD, not XCU. Users reading the label misjudge the lease cost.
>
> **Where:** Explorer lease page, cost and stake columns.
>
> **How bad:** A user trusting the label over- or under-estimates the cost by the XCU/XUSD rate; display-only, no funds move.
>
> **Report:** 1. Open a lease on the Explorer. 2. Read the "cost (XCU)" value. 3. Compare with the lease quote from the API, which is denominated in micro-XUSD. The numbers match the micro-XUSD figure, not XCU.

No Suggested tier section, no Attachments section, no payout address in the body.

### Counter-example — killed by the gate (F-10 / XE-8274)

A fork-loser `send` was claimed as "funds lost": the block existed and the
API returned 200. **Killed at Q1** — the `finalized` field was `false`, the
fork winner was `finalized: true` and the amount was claimable in the
recipient's pending set. The success signal (200 + block exists) was not the
claimed state (finalized on the canonical chain). Nothing was drafted.
