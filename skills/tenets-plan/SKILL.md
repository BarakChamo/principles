---
name: tenets-plan
description: |
  Turns a feature request into a written implementation plan through the tenets ruleset: the product
  requirement restated, the boundary and contract named, concrete examples that become the test
  list, and independently green slices in order.

  Use only when the user explicitly asks to plan work through the rules — "plan this with the
  tenets", "give me a tenets plan for X". Not for ordinary code work or a single obvious change:
  those load the tenets skill, whose Rule 14 covers planning inline.
disable-model-invocation: true
allowed-tools: Read Glob Grep Bash(git ls-files:*)
metadata:
  version: '1.0.0'
  requires: 'tenets >= 2.0.0'
---

# Tenets plan

## Locate the ruleset

`<ruleset>` below is the `tenets` skill directory installed beside this one — **not** a path
relative to the working directory. Resolve it once, in this order, and use it for every path after:
`.claude/skills/tenets/`, `.agents/skills/tenets/`, then a glob for `**/skills/tenets/SKILL.md`
outside `node_modules`. Nothing found → stop: `State: BLOCKED — install the tenets ruleset skill
(skills add BarakChamo/tenets --all)`.

## Arguments

Request: `$ARGUMENTS`. If that is empty or still contains a literal `$ARGUMENTS` or `{{args}}`, ask
for the requirement in one sentence: `State: NEEDS_CONTEXT — what should this do, in product terms?`

## Phase 1 — Rules and stop conditions

Read `<ruleset>/rules/14-planning.md` first — it owns the planning contract this skill executes.
Then read rules 01, 02, 04, 10 and 11, adding 12 or 13 only when storage or request handling is in
play. If those paths do not resolve, stop: `State: BLOCKED — install the tenets ruleset skill`.

A trivial request — one file, no new export, no behavior change — does not get a plan. Answer with
Rule 14.1's six lines inline and say `Rule 1.4 satisfied inline; no plan file needed.` Stop there.

## Phase 2 — Guide context

Read only these guide slots (`<ruleset>/workflow/scope.md` names the discovery order): Documentation
map for the plan template and plan location, Commands for the gate, Tests for runner and suffixes,
Workspace map, Shared primitives, Change delivery, and recorded deviations. With no guide, use
`templates/implementation-plan.md` beside this skill, report the gate as unknown, ask once for the
test command, and stay inline-only — never block for a missing guide.

## Phase 3 — Requirement, then existing ground

Restate the product requirement, not the mechanism (Rule 14.2). Then inspect what already exists
before designing anything new (Rule 10.1): the boundary that owns this behavior, the primitive or
schema already in the repository, and the tool or platform capability that may cover it outright.
Most requests shrink here — say so when they do.

If the request would weaken a boundary, duplicate a tool, sprawl root config, or turn uncertainty
into abstraction, emit Rule 10.6's pushback **before** the plan: product goal, the conflict, the
rule or tool contract, the simpler shape. Ask only where product judgment is genuinely required.

## Phase 4 — Write the plan

Use the section headings of the template the guide names, verbatim; the bundled template is a
fallback and the guide's version always wins. Fill it so that:

- **Boundary and contract** names inputs, outputs, typed error cases, and invariants (Rule 1.4).
- **Examples** are one per business rule plus the boundary cases where it bends, each mapped to a
  named test at a real path using the guide's suffix (Rule 4.2, Rule 7.9). An example with no
  expressible assertion is flagged "requirement not yet understood" and becomes a question, never a
  test.
- **Slices** each name the files touched, which test goes red first, and the gate command; every
  slice lands green and reverts alone (Rules 11.1, 11.2). Past five slices, say "this is two plans"
  and propose the split.
- **Docs to update** names the READMEs, topic pages, glossary entries, and decision records the
  change makes stale (Rule 5.5).

## Phase 5 — Output posture

Inline by default. Write the plan to the guide's plan location only after the user has seen it and
asked for it — an explicit repository path, never a host-specific plan directory, and never while
product questions are still open. Some harnesses forbid unsolicited writes during planning; inline
output is always correct.

Close with one line:

```text
Plan: 3 slices, 7 tests, gate bun run check; docs 2 files; inline (not written).
```

Open questions are `?` lines above that. An unresolved product question ends the response with
`State: NEEDS_CONTEXT — <the question>` rather than a guess.
