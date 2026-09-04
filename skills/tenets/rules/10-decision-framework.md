# 10 Decision Framework

Apply before choosing architecture, implementation path, integration boundary, tool setup, storage
model, API shape, or substantial refactor — it keeps uncertainty from becoming custom code, config
sprawl, or brittle abstraction.

## 10.1 Decision Order

1. Restate the **product requirement**, not the proposed mechanism.
2. Check the relevant **engineering rules**.
3. Inspect existing code, boundaries, tools, providers, libraries, platform capabilities.
4. For external or version-sensitive behavior, read current evidence: official docs/specs,
   changelogs, CLI help, source.
5. Choose the simplest path that satisfies the requirement, preserves contracts, and keeps ownership
   clear.

Custom code is justified only after the native tool, platform, library, or existing primitive is
understood and proven insufficient.

## 10.2 Contract Contradictions

When observed behavior contradicts an expected contract, it is a bug until proven otherwise — never
explain it away, weaken tests, broaden docs, or add fallbacks before the root cause. Preserve or add
the failing assertion; identify and instrument the exact boundary that decides the behavior; prove
whether the call, state, config, version, provider, or docs are wrong. Accept new behavior only with
the source/version/payload that proves the contract changed; if the bug is ours, fix the caller and
keep the stricter contract.

## 10.3 Occam's Razor

Prefer the fewest moving parts that satisfy the requirement and rules; remove layers, protocols,
scripts, abstractions, states, fallbacks, and configuration that correctness, safety, and
observability do not need.

- If the tool already does it, configure the tool.
- If a boundary can hide complexity, deepen the boundary.
- If provider detail leaks, move it behind an adapter.
- If a workflow needs many special cases, recheck ownership.
- If a fix needs a workaround for a workaround, reread the product goal.
- If the solution is hard to explain plainly, simplify.

The preferred design is boring at the call site and explicit at the boundary.

## 10.4 Tool-Native Order

Prefer, in order: existing tool/platform/provider/project capability; repo-owned configuration; a
thin delegating script or adapter; custom implementation only when the behavior cannot otherwise be
expressed. Stop before duplicating the package manager, task runner, formatter, compiler, test
runner, dependency analyzer, Git, deployment platform, database, schema system, or an existing
project module.

Deliberate calibration: this inverts the zero-dependency default of safety-critical sources —
product engineering buys leverage from mature tooling; hand-built infrastructure costs the time and
glue it was meant to save.

## 10.5 Ownership Boundaries

When each attempted fix adds wrappers, fallbacks, shims, or config exceptions, stop and restate
ownership. Use the layer with authority and context:

- Application/domain code owns behavior, contracts, state transitions.
- Orchestration (job runners, workflows, schedulers) owns lifecycle, retries, publishing, cleanup.
- Providers stay behind adapters and never define core vocabulary.
- Product packages expose stable domain ports, not provider details or sequencing internals.
- Policy tooling verifies repository rules; it reimplements nothing.

Adding an integration starts with the provider-neutral port; provider types, payloads, or protocol
terms leaking into service or domain logic move behind the adapter.

## 10.6 Pushback and Pivot

Push back before implementing when a request would weaken boundaries, duplicate tools, sprawl root
config, add speculative extension points, hide security/audit risk, or turn uncertainty into
abstraction. Format: name the product goal; name the conflict; cite the rule or tool contract;
propose the simpler shape; ask only when product or architecture judgment is required.

Uncertainty is acceptable; hiding it in code is not. Before changing root config, dependencies, or
architecture from local symptoms, apply Rule 06.2.

## 10.7 Final Check

Verify: the implementation serves the product requirement; public surface smaller than hidden
implementation; the chosen layer owns the side effects; provider details behind adapters; tests
cover boundary behavior; failures observable (Rule 11.4); docs name the decisions; replaced paths
removed. If not, simplify before adding more code.
