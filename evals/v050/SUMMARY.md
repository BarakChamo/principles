# v0.5.0 eval results (2026-09-04)

Target: the reference consumer with all seven skills installed.

| Suite | Result |
| --- | --- |
| `scenarios.tsv` (routing) | **22/22** — includes R17/R18 expecting Rule 15 and R19 expecting Rule 07 via the deletion test; `wf=-` on every row, so no workflow skill hijacked an ordinary request |
| `abidance.tsv` | **7/7**, profile read on all seven |
| `invocation.tsv` | **16/16** — 8 explicit requests reached the named skill, 8 near-misses reached none |

No failures and no retries needed.

## Live smoke

Asked how to split a Stripe and a PayPal adapter between two agents, a fresh session cited Rules
15.1, 15.2, 15.5, 7.10 and 7.1; froze the port file and named it plus the exports map as the
convergence points; refused a shared registry barrel; and had the app compose only the adapter it
wires. It chose subpath exports inside one package rather than separate workspaces — a legitimate
variant of `docs/patterns/provider-families.md`, reached by applying the rules rather than repeating
the document, which is the behavior worth having.

## Process note

The TypeScript profile was edited while these suites were running — a write-set overlap of exactly
the kind Rule 15.1 describes. The edit was additive (one new section, no existing section touched),
so the in-flight scenarios stayed valid, and every suite passed without a re-run. Recorded because
the rule applies to the people writing it too.
