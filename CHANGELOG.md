# Changelog

## 0.3.0 — 2026-09-04

Language profiles: the rules are now language-neutral and a profile file binds them to one
ecosystem. `skills/engineering-rules/profiles/typescript.md` (~500 words) owns the TypeScript
mechanisms the rules used to hardcode — primitive names, strictness settings and forbidden escape
hatches, the boundary-parse API, test declaration form and its example, JSDoc tags, packaging and
manifest exports, ambient adapter-only access, and the adapter throw-translation snippet. A profile
may bind, append ecosystem rules, or waive an anchor with a reason; anchors stay citable in every
ecosystem. `tenets.json` gains a `profile` field (default `typescript`), the loading protocol reads
the profile alongside matched rules, `/rules-init` detects and records it, and `/rules-check` audits
it. Measured after the split: 17/17 routing (14 triggers, 3 negatives silent) and 7/7 abidance,
with the profile read in all seven mechanism scenarios — no loading or instruction-quality
regression against the pre-split baseline (17/17 and 7/7). All packages at 0.3.0.

## 0.2.0 — 2026-09-03

@tenets/env extracted from the reference monorepo: composable typed environment contracts on
Zod 4.5 with compiled parsing (~29x steady-state, benchmarked), inheritance/override/diamond
composition tests, Next.js adapter tests, and deployed-rule hardening. Credits added across all
packages (t3-env, neverthrow, invariant/tiny-invariant lineage). All packages at 0.2.0.

## 1.0.0 — 2026-09-03

Initial release: 13 rules with stable anchors and a measured loading protocol, trigger-routing
index, project-guide template and discovery convention, /rules-init and /rules-check commands,
the @tenets/result and @tenets/invariant packages (53 specs), and the routing eval suite (18/18 rule loading under
adversarial minimalism hooks; negatives silent).
