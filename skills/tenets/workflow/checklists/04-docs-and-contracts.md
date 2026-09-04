# Dimension 4 — Docs and contracts (Rules 05, 01)

- Does every repository-owned source and test file carry the preamble the guide's schema requires,
  stating durable responsibility? (5.1)
- Do public package APIs, exported schemas, and non-obvious exports document what applies: formats,
  ranges, units, defaults, auth and environment assumptions, idempotency, expected error kinds,
  invariant throws, side effects, cleanup semantics? (5.2)
- Is documentation free of restatement — no `@param id - The id`, no narrated assignments? (5.2, 5.3)
- Are known abstraction leaks recorded where callers will meet them? (5.2)
- Do comments explain only the non-obvious: domain rules, workarounds, magic numbers, security
  constraints, protocol quirks, concurrency assumptions? (5.3)
- Are nearby comments still true after the change? A stale comment is a failing contract. (5.3)
- Does each workspace README state its contract, covering every declared export and subpath, with
  commands in a `Command | Use` table? (5.4)
- Did a changed public contract, schema, command, or capability update its README, topic page, and
  guide in the same change? (5.5, 4.4)
- Are there competing sources of truth — a procedure pasted in several places instead of linked? (5.5)
- Does the implementation name its boundary, API, inputs, outputs, error cases, invariants, tests,
  and docs before the code, for non-trivial work? (1.4)
- Are replaced paths fully removed: no `V2` names, deprecated shadows, or speculative modules? (1.5)
