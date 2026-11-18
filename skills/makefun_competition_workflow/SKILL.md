# Make.fun Competition Workflow

## Check quota and score first

- Run `get_entry_quota` for the competition before you build a new version.

- Stop and report when the quota is exhausted instead of building an entry you cannot submit.

- Run the kit `check` command and read the score before you ask for a submit decision.

- Submit only when the score meets the expectation the user set for that competition.

- Remember that only the latest entry counts, so never submit a replacement that gambles away a paid position without a clear gain.

## Read the final selection rules

- Read `competition.yaml` before you judge rank, since the final selection may use a fresh instance instead of the dev leaderboard.

- Check the tie break rules in the competition files before you chase a score or a call count.

- Treat every provisional rate as provisional until the final run finishes, and never report it as a final result.

- Report rank and win rate with the run they came from, and name the final run date when you know it.

## Build and verify the entry

- Init the anchor first and commit it before you write the entry code.

- Verify the entry yourself with a deterministic check, screenshots you viewed, and the kit gate before you propose a submit.

- Build the transcript bundle with the flags the current kit requires, and re-check the kit format when the kit version changes.

- Compare local performance numbers with care, since server hardware grades the entry and local timing can mislead.

## Run a strict recording

- Start the recording in the first turn of a brand-new chat before you spawn any builder or fixer agent.

- Keep the main chat completely quiet during the recording window, since any write there can bundle the main session into the recording and break the seal.

- Take the design brief from memory only during the window and never read an agent-written brief file from disk, since reading it can pull an older session into the recording.

- Let the builder read the kit only and view the reference image when one is named, since viewing the image does not pull its author into the seal.

- Write the entry code fresh in a fresh empty repo with the anchor committed first, and never copy an earlier main file, since copied lines can break the thinking reproduction check.

- Verify two byte-identical runs, view the render yourself, and run the kit check before you seal the recording.

- Seal the recording with an explicit usage file that covers the parent, builder, fixer, and any extra session named in the hold message, since the recorder otherwise reads the default usage file from an earlier entry.

## Available connectors

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Alternatives for better results

- Submit an early version to measure the provisional rate when quota allows, then iterate only when the gain is clear.

- Retest a performance sensitive entry on a second machine before you trust a local timing win.
