# Changelog

## 0.4.0 — 2026-09-04

Workflow skills, and one `tenets` namespace.

The ruleset skill is renamed `engineering-rules` → `tenets`, and four workflow commands join it as
sibling skills: `/tenets-audit` (severity-ranked compliance report for a repo, package, or subtree),
`/tenets-review` (PR, branch, or dirty tree, plus an intent audit of the active plan against what
the diff actually does), `/tenets-plan` (requirement, contract, examples-as-tests, green revertable
slices), and `/tenets-realign` (ordered slice plan, applied only on approval, one green commit per
slice). The two setup procedures become real skills too — `/tenets-init` and `/tenets-check` — which
fixes a defect: they shipped in a `command/` directory that no harness ever registered, so neither
was invokable.

They share `tenets/workflow/`: `findings.md` (finding grammar over Rule 9.1's severities, internal
confidence with suppression, dedup, summary grammar, worker schema), `scope.md` (guide slots per
consumer, git scope modes, effort thresholds, dimensions, degradation), and six dimension
checklists. The workflow skills restate no rule content — they cite anchors.

New **Rule 14 Planning**: the plan as a contract stated before the code — boundary, API, error
cases, invariants, tests, docs — with examples becoming the test list and requirement before
mechanism. It lives in the rules rather than only in `/tenets-plan`, so an agent already planning
mid-task gets it through the index.

Portability is deliberate: no forked-context frontmatter, no hooks, no shell-output injection, and
no positional argument placeholders (`$1` is the first argument in some harnesses and the second in
others). Parallel work is expressed as intent, so a harness without parallel workers runs the same
procedure sequentially for the same output. Claude Code, Codex and Cursor invoke the skills
directly; `/tenets-init` offers two-line shims for Gemini CLI, opencode and Cline, plus the
`GEMINI.md` pointer Gemini CLI needs before it will read AGENTS.md at all.

The eval harness gained a real gate: it now records which skill fired, so a workflow skill answering
an ordinary request fails the run instead of silently passing as the ruleset. A new
`evals/invocation.tsv` covers command routing and adversarial near-misses. All packages at 0.4.0.

## 0.3.0 — 2026-09-04

Language profiles: the rules are now language-neutral and a profile file binds them to one
ecosystem. `skills/tenets/profiles/typescript.md` (~500 words) owns the TypeScript
mechanisms the rules used to hardcode — primitive names, strictness settings and forbidden escape
hatches, the boundary-parse API, test declaration form and its example, JSDoc tags, packaging and
manifest exports, ambient adapter-only access, and the adapter throw-translation snippet. A profile
may bind, append ecosystem rules, or waive an anchor with a reason; anchors stay citable in every
ecosystem. `tenets.json` gains a `profile` field (default `typescript`), the loading protocol reads
the profile alongside matched rules, `/tenets-init` detects and records it, and `/tenets-check` audits
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
index, project-guide template and discovery convention, /tenets-init and /tenets-check commands,
the @tenets/result and @tenets/invariant packages (53 specs), and the routing eval suite (18/18 rule loading under
adversarial minimalism hooks; negatives silent).
