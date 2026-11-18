# Verified Scheduled Monitoring

## Confirm the schedule is live

- Verify the schedule in the live schedule list before you tell the user that a reminder, scan, or watchdog is active.

- Record the schedule identifier, the next run time, and the check time when the live list confirms it.

- Treat a creation receipt as unconfirmed until the live list shows the same schedule identifier.

- Re-check the live list after any change, restart, or gap in reporting before you repeat an active claim.

- Tell the user plainly when a schedule is missing from the live list instead of repeating the earlier creation claim.

- Use this skill for recurring system jobs and monitors, not for calendar appointments with other people.

## Report only verified state changes

- Check the job, the process, or the last output directly before you report that it is running, stopped, or finished.

- Report a stopped job with its last verified progress, its last verified run time, and the length of the unverified gap.

- Stay silent only after a check has confirmed normal operation for that interval.

- Correct an earlier active claim as soon as a live check contradicts it and name what changed.

- Never claim that missed work will be caught up unless a later verified run shows the missed work completed.

## Restart and hand over safely

- Ask for approval before you restart a job that changes state, sends a transaction, or spends funds.

- Restart from the last verified progress point and re-verify live state before you restart.

- Verify the restarted job in the live list and by a fresh output check before you report success.

- Stop automatic restarts after three consecutive failed restarts and hand the failure to the user with the failure detail.

- Keep report-only jobs report-only and never let a restart turn a monitor into an action that the user did not approve.

## Available connectors

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Alternatives for better results

- Ask the user to choose a single owner and a single stop condition when several monitors could watch the same job.

- Offer a manual check step when a schedule cannot be listed reliably so the user can confirm the next run directly.
