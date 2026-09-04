# Dimension 2 — Structure and API depth (Rules 03, 07)

- Is the module's public surface smaller than its hidden implementation, and does it hide a volatile
  decision rather than expose sequencing? (3.6)
- Would a caller need to know resolution order, retry rules, startup sequencing, or polling cadence?
  If so the module is too shallow. (3.6)
- Do protocol wrappers stay thin — parse, call one use-case function, map the result — with
  orchestration living in services? (3.2)
- Is control flow flat and bounded: length and nesting within the Rule 3.3 signals, no nested
  ternaries or compound boolean soup? (3.3)
- Does every loop over unbounded input carry an explicit bound, or a comment stating why the input is
  finite? (3.3)
- Does recursion document a termination bound? (3.3)
- Are exports the smallest useful surface, with no internal helpers, intermediate domain models, or
  provider types leaking? (7.3)
- Do cross-workspace imports go through declared public exports rather than another workspace's
  internals? (7.2)
- Do dependency directions follow the guide's permitted graph? (7.2)
- Are side effects named and isolated, with injected environment, logger, and clock in product
  modules? (3.8)
- Are function shapes hard to misuse: object parameter for multi-input operations, units in names,
  boolean prefixes, narrow return types? (3.4)
- Does any new package earn its existence by hiding a real policy, rather than grouping helpers? (7.5)
