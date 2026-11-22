# skill-catalog

A static catalog of 98 AI agent skills — search, filter by category, read descriptions, copy, and open each skill's `SKILL.md` file on GitHub.

Open `index.html` in a browser (or serve this folder with any static server, e.g. `python3 -m http.server`). Skill data lives in `skills.json`; each skill's contents live in `skills/<skill-name>/`.

## Categories

| Category | Count |
|---|---:|
| Bug Bounty & Audit | 31 |
| Engineering | 47 |
| Mint & NFT | 9 |
| Documents | 8 |
| Utilities | 2 |
| **Total** | **98** |

## How to use

- Type in the search box to filter skills live.
- Click a category chip to filter by category.
- **Copy description** copies the skill description to the clipboard.
- **View** opens the skill details.
- **GitHub ↗** opens that skill's `SKILL.md` file in this repo.

## Security note

Every skill in this repo passed a secret scan before publication (2026-11-18): no API keys, tokens, private keys, seed phrases, user wallet addresses, personal emails, or passwords inside. Any `0x...` addresses appearing in some skills are public contract addresses or example placeholders. The file `launch-curve-audit/roles.example.env` contains only placeholders (`TOKEN=<redacted>`).
