# Dimension 3 — Tests (Rule 04)

- For each behavior change, is there a test that would fail without the implementation, for the
  right contract reason? (4.2)
- Does every documented error kind have a behavioral test, alongside the happy path? (2.6, 4.3)
- Are schema rejections tested at the boundary, and invariant throws where invariants exist? (4.3)
- Are observable postconditions asserted — persisted state, emitted events, cleanup, immutability?
  (4.3)
- When touched, are authentication, authorization, resource cleanup, external mutations, and policy
  decisions covered? (4.3)
- Do tests assert through public boundaries, with internal seams used only when they own real
  behavior? (4.4)
- Do tests avoid knowing helper call counts, call order, or cache internals? (4.4, 4.7)
- Is each test at the lowest level that proves its contract, with anything crossing a process or
  service boundary covered by an integration rather than a fake? (4.4, 4.6)
- Do test names read in domain language, naming observable behavior? (4.6, 7.9)
- Do factories carry sensible defaults with only relevant fields overridden? (4.5)
- Are there tests that only prove exports exist, snapshots standing in for assertions, or tests that
  would pass against a no-op? (4.7)
- Do filenames use the guide's suffix for their scope? (4.6)
