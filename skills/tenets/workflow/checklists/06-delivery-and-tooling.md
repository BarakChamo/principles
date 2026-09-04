# Dimension 6 — Delivery and tooling (Rules 11, 08)

- Is each commit one logical change, with refactors separated from behavior changes? (11.1)
- Does every commit pass the acceptance gate and revert cleanly on its own? (11.2)
- Is unfinished behavior unreachable — behind a flag or unwired — rather than half-shipped, and is
  that isolation deleted when the work completes? (11.2, 1.5)
- Are commit messages imperative and carrying the why, not a file list? (11.2)
- Is any metric being optimized as a target rather than read as a signal? (11.3)
- Does a production-relevant behavior change ship the signal to see it fail: a log with actionable
  context, a health state, or a metric? (11.4)
- Are expected failures logged where the boundary translates them, and invariant failures surfaced
  loudly? (11.4)
- Does normal work use documented repository-owned commands, with no undocumented global tools or ad
  hoc variants? (08)
- Are new dependencies, packages, root-config changes, or gate changes within explicit task scope or
  backed by a decision record? (7.8, 8.3)
- Are there local suppressions standing in for a central decision? (08)
- Does new enforcement prefer native tool capability over custom policy code? (08, 10.4)
- Are cache declarations and generated-state exclusions accurate and aligned across tools? (8.3)
- Do hooks stay cheap and scoped, never running integration or end-to-end work? (8.2)
