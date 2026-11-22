---
name: query-address-info
description: |
  Snapshot of a single wallet's token holdings on a specific chain — list of every token currently held with
  name, symbol, current price, 24h price change, and holding quantity.
  Use when the user provides an explicit wallet address (or says "my wallet") and wants the current portfolio:
  "what does 0x... hold", "wallet balance breakdown", "list positions for this address",
  "what tokens are in this wallet", "show me the holdings of <address>".
metadata:
  author: binance-web3-team
  version: "2.0"
---

# Boss Guardrails (binding, added at install 2026-11-22 — upstream content below is verbatim)

- **Read-only.** This skill only reads public holdings via Binance's public Web3 API (`scripts/cli.mjs`, zero-dep Node ≥ 22). It cannot trade, move, or approve anything.
- **No API key, no secrets.** The endpoint needs no auth. Never put keys, passwords, or private material in a query.
- **Only query addresses the user named.** Wallet addresses are public on-chain data, but only look up an address from the user's task, from Boss's own tracked wallets, or from a jp-wallet candidate already under review. Never go fishing through random wallets.
- **Snapshot only.** Holdings are a point-in-time snapshot — not history, not PnL, not proof of profit. Say so when reporting.
- **SkillSpector 2026-11-22:** score 7/100 LOW CAUTION, 1× LP3 MEDIUM (no declared tool scope — mitigated here: scope is declared in these guardrails; script verified read-only, input-validated, no file/shell/env access). Review: `~/workspace/skill-review/binance-web3/REVIEW.md`. Source: binance/binance-skills-hub (no LICENSE in repo root — treat as unlicensed upstream content used read-only).

# Query Address Info Skill (upstream, verbatim)

## Overview

This skill queries any on-chain wallet address for token holdings, supporting:

List of all tokens held by a wallet address
Current price of each token
24-hour price change percentage
Holding quantity

## When to Use This Skill

| User intent | Command |
|-------------|---------|
| List a wallet's token holdings with price and 24h change | `positions` |

## Supported Chains

| Chain | chainId |
|-------|---------|
| BSC | `56` |
| Solana | `CT_501` |
| Base | `8453` |
| Ethereum | `1` |

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs positions '{"address":"0x...","chainId":"56","offset":0}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `positions` | List wallet token holdings (price + 24h change + quantity) | `address`, `chainId`, `offset` | `node <skill-dir>/scripts/cli.mjs positions '{"address":"0x...","chainId":"56","offset":0}'` |

## Rules

- **`offset` is required on every call — including the first page.** Pass `0` to fetch the first page; increment for subsequent pages. Omitting it causes an upstream validation error.
- **Pagination**: repeat with increasing `offset` until `data.list` is empty or shorter than the page size.
- **Icon URL prefix**: `icon` is a relative path (e.g., `/images/web3-data/public/token/logos/xxxx.png`). Prepend `https://bin.bnbstatic.com` to render.
- **Numbers as strings**: `price`, `percentChange24h`, `remainQty` are strings — convert to numbers before arithmetic.

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, parameter tables, return-field tables, and real response samples.
