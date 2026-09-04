# 09 Code Review

Review behavior, contracts, safety, tests, and docs. Findings first; summaries second.

## 9.1 Severity

**BLOCK** — cannot merge:

- a type-system escape hatch the profile forbids; missing boundary validation,
- untyped expected throws, throwing across a recoverable contract, swallowed errors, or an invariant
  failure recovered from,
- an internal import across a workspace boundary; app wrapper containing business orchestration,
- credential/secret leakage, isolation or privilege escape, data-loss, or unauthorized external
  mutation risk,
- unauthorized dependency/root-config/package change; failing required check.

**REQUIRED CHANGES** — fix before merge:

- missing behavioral tests for changed behavior or a documented `Result` error type,
- missing or junk documentation on exports; missing file preamble,
- package README, topic page, work artifact, or project guide made stale by the change,
- shallow public API/export leaking implementation sequencing.

**SUGGESTION** — non-blocking: naming, extra edge tests, deeper `@remarks`, simplification,
out-of-scope refactors.

**MINOR** — informational notes or praise; never affects merge.

## 9.2 Review Checklist

- Untrusted input parsed with the owning schema?
- Recoverable failures as typed `Result` errors; declared boundary exceptions translated once?
- Invariants limited to impossible states; postconditions asserted where promises warrant (Rule
  02.2)?
- Data immutable; control flow inside the Rule 03.3 signals?
- Public API narrow and deep?
- Would at least one test fail for the right reason without the implementation?
- Tests behavioral, through public boundaries?
- Auth, cleanup, external mutations, and policy effects tested when touched?
- Docs, README, topic page, or ADR updated as needed?
- The project's standard commands used (project guide)?

## 9.3 Feedback Format

Exact severity, rule anchor, location, fix:

```text
**[BLOCK] Rule 02.1** path/to/file.ts:42 parses request data manually. Replace the custom checks
with the owning schema's safe parse and return a typed validation error.
```

Never vague: "missing test for provider timeout returning `err({ type: "provider_timeout" })`" is
actionable; "add more tests" is not.

## 9.4 Scope and Decision

Review the diff; pre-existing issues block only when the change worsens them or touches
safety/security. Unmapped patterns are suggestions at most unless they create safety, correctness,
or data-loss risk. Topic pages and work artifacts never override rules; conflicts take the higher
severity, and contradictory reviewer guidance escalates to a human.

Any BLOCK → request changes. Only REQUIRED CHANGES → approve-with-changes if project policy allows.
Suggestions/minor only → approve. No findings → say the diff follows the rules and name residual
risk or unrun checks.
