# 04 Testing

Tests prove behavior, not structure; every test answers **what bug would this catch?** Each covers
one realistic behavior a caller can trigger; mock only slow, flaky, nondeterministic, or
side-effectful boundaries.

## 4.1 Required Shape

Explicitly import `describe`/`it` from the project's runner, use Given/When/Then comments, and
assert the expected throw/rejection message — not merely that something threw:

```ts
describe('Package.operation', () => {
	it('should return ConflictError when saving a stale draft', () => {
		// Given: a draft based on an outdated revision
		// When: the caller attempts the save
		// Then: save returns a typed conflict error
	});
});
```

## 4.2 Behavioral TDD Loop

Before the first test, derive concrete examples from the product requirement: one per business rule
plus the boundary cases where it bends. The example list becomes the test list, named in domain
language (Rule 7.9); a requirement with no expressible example is not yet understood.

Start at the smallest boundary that would fail without the behavior — public contracts when clear,
internal seams when they own meaningful behavior. A red test counts only when it fails for the
expected contract reason, not setup noise.

1. **Red:** add or update a behavioral test at the smallest useful boundary.
2. **Green:** the smallest code that satisfies the contract.
3. **Refactor:** simplify names, modules, duplication — only while green.

Never refactor before proving behavior.

## 4.3 Coverage Rules

Coverage is feedback, never a target or gate (Rule 11.3). Deliberate calibration: test-per-function
mandates serve safety-critical infrastructure; a web application earns nothing from tests written to
satisfy a number, and fake tests rot trust.

Every behavior change covers: happy path; every documented `Result` error type; schema rejection at
the boundary; invariant throws where they exist; observable postconditions (persisted state, emitted
events, cleanup/preservation, immutability); and, when touched, authentication, authorization,
resource cleanup, external mutations, policy decisions.

## 4.4 Boundaries and Contracts

Test boundaries, invariants, and observable effects. Prefer public APIs — package exports, HTTP
routes, RPC/tool schemas, CLI output/exit, SDK methods, adapter contracts. Narrower internal seams
are valid when they own parsing, normalization, idempotency, retry math, or state transitions, but
must still prove observable behavior or a domain invariant; Rule 07.2's `src`-import ban applies to
tests too.

Adapters share contract tests over normalized interfaces; interchangeable providers each run the
same contract for their roles — never an E2E provider cross-product. Interfaces that hide sequencing
get contract tests for success and caller-observable failures; tests must not know helper counts,
call order, or cache internals.

Unit tests cannot prove external behavior: anything depending on another process, service, or
resource needs a focused integration: fakes prove routing logic, but proving an external CLI
performs the operation takes an integration or live profile. For state machines, queues, and
idempotency keys, test invariants across states: repeated cycles must not duplicate active work;
in-progress user data stays preserved.

## 4.5 Test Data

Factories with sensible defaults; tests override only relevant fields. Prefer upstream-maintained
helpers at external boundaries (network, storage, filesystem, clock, process/env). Never mock the
unit under test or internal helpers to ease assertions; never maintain a substitute implementation
of an external protocol when collaborator tests plus one real integration prove more.

## 4.6 Organization and Levels

Tests live with the owning workspace; `describe` names the public unit (`CatalogService.search`),
`it` names observable behavior. The project guide owns locations, filename patterns, runners, and
selection.

Use the lowest level that proves the contract:

- **Unit:** pure contracts, parsing, state transitions, typed errors; never touches live services.
- **Local integration:** one real local boundary or resource lifecycle.
- **Live integration:** one real remote boundary and its cleanup contract.
- **E2E:** a complete user journey; live services only when required.

When E2E exposes a stable boundary contract, move it down and keep at most one full-journey proof.

## 4.7 Prohibitions

- No tests that only prove exports exist, or that pass when the implementation is a no-op.
- No snapshots as a substitute for behavioral assertions.
- No asserting private helper call order unless it is part of the public contract.
- No deleting or weakening tests to fit a change unless the contract changes and docs are updated.

## 4.8 Release Gates

Routine validation is affected-aware and cacheable; release gates rerun the full suite without
trusting prior cache. A selected test fails when prerequisites are incomplete — it never hides
behind a skip. Scoped runs are debugging tools, not completion evidence; when full validation is
unavailable, record what was omitted and why. The project guide owns phase commands.
