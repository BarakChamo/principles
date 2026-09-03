# 01 Coding Philosophy

Functional-first, immutable, contract-driven TypeScript. Optimize for correctness, reviewability,
and agent legibility before speed.

## 1.1 Non-Negotiables

- Validate untrusted data at boundaries.
- Represent expected failure with `Result<T, E>` / `ResultAsync<T, E>`.
- Use `invariant()` only for impossible programmer-error states.
- Prefer immutable data: `const`, readonly inputs, spreads, non-mutating transforms.
- Keep modules deep: small public API, meaningful hidden implementation.
- Write behavioral tests before or alongside behavior changes.
- Document exported behavior and non-obvious decisions.

## 1.2 Design Order

1. **YAGNI:** no speculative extension points.
2. **KISS:** the simplest design that preserves the contract.
3. **DRY:** abstract after three real repetitions or one clear boundary benefit.
4. **SOLID/principles:** only when they reduce real complexity.

Rule 10 governs larger architecture and tooling decisions.

## 1.3 Contracts Everywhere

Every public function, package boundary, adapter boundary, and workflow step has a contract:
**preconditions** (schema parse, type signature, or invariant), **postconditions** (returned values,
typed errors, persisted state, side effects, immutability promises), and **invariants** (facts that
stay true after success). Enforce contracts at both ends where cheap (Rule 02.2, the airlock).

Schemas own untrusted runtime boundaries; derive TypeScript types from the schema so runtime and
compile-time contracts cannot drift.

## 1.4 Deep and Legible Code

Before implementing, name the boundary, public API, inputs, outputs, error cases, invariants, tests,
and docs to update; non-trivial work uses the implementation-plan template the project guide names.

Make invalid states unrepresentable: discriminated unions, branded IDs, schemas, narrow public
types. Export a purpose-built DTO, not the internal domain model. Prefer predictable structure over
cleverness — readers should find validation, core logic, tests, and docs without guessing.

## 1.5 Clean Deletion

Replacing code removes the old path completely unless a migration period is explicitly required. No
`V2` names, deprecated shadows, speculative modules, or README stubs unless the task requires them.
Scaffold placeholders exist only before behavior does, and must say they are placeholders.
