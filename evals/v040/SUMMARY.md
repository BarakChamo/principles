# v0.4.0 eval results (2026-09-04)

Target: the reference consumer with all seven skills installed.

| Suite | Result |
| --- | --- |
| `scenarios.tsv` (routing) | **20/20** — 16 triggers incl. two new Rule 14 rows, 3 negatives silent, and `wf=-` on every row (no workflow skill hijacked an ordinary request) |
| `abidance.tsv` (rule abidance) | **7/7**, profile read on all 7 |
| `invocation.tsv` (command routing) | **16/16** after two fixes — 8 explicit requests reach the named skill, 8 adversarial near-misses reach none |

Two failures were real and fixed rather than reinterpreted:

- `/tenets-init` and `/tenets-check` were not being invoked because the AGENTS.md mandate did not
  name them. Naming every workflow command, in directive form, is what makes them discoverable —
  their descriptions deliberately stay out of context.
- An agent invoked the ruleset skill with `tenets-check` as an *argument* and globbed inside it for
  the procedure, so the index now states the workflow skills are siblings invoked by their own names.

One expectation was genuinely mis-specified: "plan this with the tenets" satisfied Rule 14 inline
rather than invoking `/tenets-plan`, which is the designed behavior for an agent already planning.
The scorer now accepts either (`skill:tenets-plan|rule:14`).

Live smoke, one per skill, in the reference consumer: audit produced two correctly anchored findings
on `libs/text`; review on a deliberately dirty tree named its scope rung, reported no plan found with
the confidence cap, flagged the undeclared export, and returned four correct findings; plan produced
requirement/contract/examples/slices/docs inline with no file written; realign audited, found only a
SUGGESTION, excluded it per its own clustering rule, and wrote nothing (`git status` clean).
