# Findings format

The shared output contract for `tenets-audit`, `tenets-review`, and `tenets-realign`. Severity comes
from Rule 9.1 and is never redefined; this file adds only location, confidence handling, dedup, and
the summary grammar.

## Finding line

```text
**[BLOCK] Rule 02.1** apps/api/src/route.ts:42 — parses the request body manually. Fix: parse with the owning schema and return a typed validation error.
```

Grammar: `**[SEVERITY] Rule N.M** <path>:<line> — <problem>. Fix: <one line>.`

- **Severity** is exactly one of Rule 9.1's four: BLOCK, REQUIRED CHANGES, SUGGESTION, MINOR. Never
  invent a fifth. An unmapped pattern is a SUGGESTION at most unless it risks safety, correctness,
  or data loss (Rule 9.4).
- **Anchor**: exactly one per finding, written as the rule file writes it (`Rule 02.1`). A profile
  addition cites the profile (`typescript A2`). No anchor means it is not a ruleset finding — drop
  it or file it as SUGGESTION, never higher.
- **Location** is a real path and line that was actually read.
- **Fix** is one line naming the change, not an essay.

## Confidence

An internal 1–5 judgment, **never printed**:

- 1–2: drop silently.
- 3: print with a trailing `(unverified: <what to check>)`.
- 4–5: print plain.

## Evidence, both directions

Every finding names a path and line that was read. Every *clearance* needs the same standard: "the
framework handles it", "presumably validated upstream", and "this looks fine" are not clearances.
Name the file and line that makes it safe, or file the finding at confidence 3.

Flag only what affects correctness, safety, or the stated requirement. A reviewer asked to find gaps
will invent them; extra abstraction and defensive code are the cost. Everything else is optional.

## Dedup and volume

- Fingerprint: `anchor + path + nearest enclosing symbol`. On collision keep the highest severity
  and merge the fix lines.
- The same anchor in more than five files collapses to one finding with a count and three example
  locations.
- Order by severity (BLOCK, REQUIRED CHANGES, SUGGESTION, MINOR), then by path.
- Omit empty severity sections entirely. No "None", no restated checklist, no table of contents.
- Findings are flat lines. Tables are for rubrics, never for findings.

## Summary line

Exactly one line, last:

```text
Audit: CHANGES NEEDED — 2 BLOCK, 3 REQUIRED, 5 SUGGESTION, 1 MINOR; rules 01,02,04,09; scope apps/api 12 files / 480 lines; gate not run; suppressed 3 low-confidence, 1 recorded deviation.
```

Label is `Audit`, `Review`, `Plan`, or `Realign`. Decisions: review and realign use Rule 9.4's
mapping (`REQUEST CHANGES`, `APPROVE WITH CHANGES`, `APPROVE`); audit uses `BLOCKERS PRESENT`,
`CHANGES NEEDED`, or `CLEAN`. Every count comes from something actually run — never estimated — and
the line names any check that was skipped.

No findings still names residual risk (Rule 9.4):

```text
Audit: CLEAN — 0 findings; rules 01,02,04; scope libs/text 3 files / 96 lines; unverified: live integration paths; gate not run.
```

## State protocol

Emit only when the state is not a plain success:

- `State: BLOCKED — <reason and the unblocking action>`
- `State: NEEDS_CONTEXT — <the single question>`
- `State: DONE_WITH_CONCERNS — <what remains>`

Any retryable step gets at most three attempts before escalating this way (Rule 6.2).

## Worker return schema

A worker handling one dimension returns one JSON object per line and nothing else, or the literal
`NO FINDINGS`:

```json
{"severity":"BLOCK","anchor":"02.1","path":"apps/api/src/route.ts","line":42,"problem":"...","fix":"...","confidence":4,"symbol":"POST"}
```

Unknown line is `0`; a missing anchor omits the field. Cap 15 findings per worker, highest severity
first. A worker that fails or returns nothing is reported as `dimension <n>: no result` in the
summary and never silently dropped.
