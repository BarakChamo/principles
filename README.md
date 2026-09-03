# principles

An engineering ruleset for TypeScript monorepos, distilled from the canon and packaged as an agent
skill: **13 generic rules behind a trigger-routing index, one editable per-project translation file,
two setup commands, the two primitive packages the rules require, and an eval suite** that measures
whether agents actually load and follow the rules.

Built for coding agents first: rules are dense, anchored, and loaded per task (2–4 files,
~1.5–2.5k tokens) rather than crammed into an always-on context file. Humans get the same benefit —
a small, opinionated, internally consistent standard with its deviations written down.

## The principles behind the rules

Each rule distills a respected source, keeping its teeth and recording every deliberate deviation:

| Rule | Core principle | Primary sources |
| --- | --- | --- |
| 01 Coding Philosophy | Correctness, reviewability, and agent legibility before speed; YAGNI → KISS → DRY in that order; deleted code leaves no shadows | Ousterhout, XP |
| 02 Error Handling | Every failure lives in exactly one tier — boundary schema, invariant, or typed `Result` — and assertions guard **both ends** of an interaction (the airlock); an invariant failure is never caught to recover | Design by Contract (Meyer), TigerBeetle's tiger-style, railway-oriented programming (Wlaschin), result-type practice |
| 03 Function Design | Flat, bounded, boring control flow; deep modules that hide one volatile decision behind one operation; thin protocol wrappers | Ousterhout's *A Philosophy of Software Design*, tiger-style control-flow discipline |
| 04 Testing | Examples derived from the requirement become the test list; behavioral red-green-refactor; coverage is feedback, never a target — a deliberate calibration away from safety-critical test-per-function mandates | TDD (Beck), BDD discovery/formulation (Cucumber), contract testing |
| 05 Documentation | Document why and contracts, never restate code; preambles on every owned file; docs that lie are worse than none | living-documentation practice |
| 06 Learnings Process | Non-obvious discoveries go to an inbox before curation; three failed attempts or ten stuck minutes triggers stop-capture-ask | operational learning loops |
| 07 Repository Conventions | Workspace families with one-way dependencies; smallest useful export surface; schemas owned by the operation's package; strict TypeScript non-negotiables | monorepo practice, information hiding |
| 08 Project Tooling | One command per action; tool config owns mechanical enforcement; policy code only for what tools cannot express | DORA capabilities |
| 09 Code Review | Severity-tagged findings (BLOCK / REQUIRED / SUGGESTION / MINOR) with rule anchors and exact fixes; review the diff, not the world | rubric-based review practice |
| 10 Decision Framework | Requirement first, evidence next, simplest owning layer last; tool-native order **deliberately inverts** zero-dependency defaults — product engineering buys leverage from mature tooling | Occam, tiger-style (inverted, recorded) |
| 11 Change Delivery | Small revertable batches, one logical change per green commit, unfinished work isolated not half-shipped; metrics are signals never targets; production-relevant changes ship their failure signal | DORA (small batches, Goodhart), observability practice |
| 12 Data and State | One system of record per entity; everything else is derived with a rebuild path; no dual-writes; expand–contract migrations with n−1 compatibility | Kleppmann's *DDIA*, *Refactoring Databases*, boring-technology practice |
| 13 Serverless Runtime | Instances are caches, never truth; waterfalls are the #1 perf bug; every cache entry has an invalidation story; retries are ambient so idempotency is mandatory; everything is bounded | twelve-factor, Well-Architected serverless practice |

Two structural principles hold the set together:

- **Rules are immutable; the project guide is the only editable file.** Every project-specific fact
  — commands, stores, paths, namespaces, deviations — lives in one guide the rules defer to at
  ~14 named points. Porting the ruleset to a new repo means filling one template.
- **Anchors are API.** Sections are numbered (`Rule 4.3`), cited in reviews and guides, and never
  renumbered — new content appends.

## Using the skill

```sh
skills add BarakChamo/principles
```

Then, in the target repository:

1. **`/rules-init`** (optionally `/rules-init path/to/guide.md`) — inspects the repo, writes a
   pre-filled project guide (default `docs/project-guide.md`), and pins the routing mandate plus a
   `Project guide: <path>` line into AGENTS.md. The mandate is the determinism layer: skill
   activation is description-matched and probabilistic; the always-loaded AGENTS line is not.
2. Agents then follow the **loading protocol**: match the task against the index, Read every
   matched rule file, and open the response with `Rules: <numbers|none>` — with an explicit
   statement that brevity/minimalism instructions govern prose, never the protocol. Measured
   **18/18 correct rule loading under adversarial minimalism hooks**, negatives silent
   (see `evals/`).
3. **`/rules-check`** audits the guide later: structure, freshness against real files, quality
   bars, anchor validity, template-version match — it is also the upgrade path when the template
   version bumps.

A hard per-prompt guarantee is available as an opt-in hook (documented in
`skills/engineering-rules/README.md`) at the cost of `Rules: none` announcements on non-code
prompts.

## The primitive packages

The rules fix one API surface (Rule 7.6); everything else is configurable. This repo ships it:

- [`@principles/result`](packages/result) — `Result<T, E>` / `ResultAsync<T, E>`, `ok`, `err`,
  `map`/`mapErr`/`andThen`/`match`/`unwrapOr`/`combine`, `trySync`/`tryAsync`. Frozen variants,
  thenable async composition, dependency-free.
- [`@principles/invariant`](packages/invariant) — `invariant()` throwing `InvariantError` with
  stable metadata, plus `createInvariant` for production message stripping.

Install them from a release's tarball assets (no registry account or auth needed):

```jsonc
// package.json dependencies
"@principles/result": "https://github.com/BarakChamo/principles/releases/download/v0.1.0/principles-result-0.1.0.tgz",
"@principles/invariant": "https://github.com/BarakChamo/principles/releases/download/v0.1.0/principles-invariant-0.1.0.tgz"
```

or copy `packages/*` into your workspace. Your project guide records the location either way. npm
registry publishing is planned; the tarball URLs remain valid regardless.

## Evals

```sh
evals/run.sh /path/to/repo-with-skill-installed
```

14 positive scenarios (one per index row plus a mechanical micro-task that should honestly declare
`Rules: none`) and 3 negatives, each a fresh non-interactive session, asserting index load, correct
rule-file reads, and silence on non-engineering prompts. Run before releasing any change to the
description or index. Requires an authenticated `claude` CLI; runs cost real tokens.

## Layout

| Path | Contents |
| --- | --- |
| `skills/engineering-rules/SKILL.md` | Routing index, loading protocol, guide discovery |
| `skills/engineering-rules/rules/` | The 13 rule files |
| `skills/engineering-rules/templates/` | Project-guide template (WHAT / WHY / QUALITY BAR per slot) |
| `skills/engineering-rules/command/` | `/rules-init`, `/rules-check` |
| `packages/result`, `packages/invariant` | The required primitives (tested: 53 specs) |
| `evals/` | Routing eval runner + scenarios |
| `examples/project-guide-example.md` | A real populated guide |

## License

MIT.
