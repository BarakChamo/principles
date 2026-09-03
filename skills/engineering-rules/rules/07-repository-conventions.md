# 07 Repository Conventions

The repo shape is part of the contract: never invent a new structure when an existing package family
fits. These rules assume a workspace monorepo; the project guide names the namespace, stack, and
paths.

## 7.1 Workspace Families

- `apps/*`: private deployed entrypoints.
- `packages/*`: public or potentially publishable reusable capabilities.
- `libs/*`: private internal reusable utilities.

These family names are rule vocabulary; a project guide may map differently named directories onto
them.

All workspaces share one package namespace, uncoupled from product, deployment, or repository names
(the project guide names it); product names live in prose and executables, not import paths.

Implementation lives in `src/`. Inter-workspace APIs are explicit `package.json` exports pointing to
cohesive source modules; broad root barrels are prohibited — a root export fits only a package that
is one small cohesive contract.

## 7.2 Boundaries

- Import other workspaces only through public exports — never their `src` internals.
- Cross-package imports use installed workspace names; package-internal references may use `imports`
  aliases such as `#internal/*`.
- Apps compose packages and libs; packages depend on other packages' public APIs; libs never depend
  on apps.
- Provider adapters isolate SDKs and quirks inside the owning package.

The project guide records the exact permitted directions and their enforcement.

## 7.3 Public API Discipline

`package.json` exports define the public API — which in a monorepo also means inter-workspace APIs,
exported schemas, CLI/API contracts, adapter capabilities, and persisted artifacts callers rely on.
Export the smallest useful surface.

Never export internal helpers, intermediate domain models, provider-specific types, or sequencing
details; every export adds maintenance cost and needs tests and docs. Reserve `@internal` for useful
test-only exports, not for hiding dead code.

Review signals, not hard gates: a file past ~500 lines (split for ownership and testability; keep
cohesive schemas, fixtures, and migrations together) and more than ~20 exports from one module
(split into cohesive subpaths, not a broad aggregator).

## 7.4 Schema Ownership

The package that owns an operation owns its public schema and derived type; callers import the
schema, never duplicate the shape. Packages are trust boundaries: public package functions parse
untrusted inputs even when called from another workspace.

## 7.5 Architecture Ownership

The project guide and its architecture notes own repository-specific boundaries and state ownership.

Canonical state is durable and trusted: reviewed config, schemas, public APIs, control files,
compiled knowledge. Operational state is temporary: caches, sessions, local service state, retry
markers, cursors. Cleanup may remove operational state when policy allows; it must never silently
remove canonical state.

Moving canonical ownership, adding a workspace family, introducing storage, or altering public API
boundaries needs an ADR-level reason and matching docs. Never create a package to group helpers — no
`date-utils` grab-bags; a package earns existence when an operation like `reconcileInventory(input)`
hides classification, ordering, cleanup, and recovery policy behind one deep contract, testable and
versionable on its own.

## 7.6 Shared Primitives

Never reimplement the shared primitives: `Result`/`ResultAsync`/`ok`/`err`, `invariant` with its
`InvariantError` failure type, and branded IDs or schema helpers once implemented. These exact names
are the ruleset's required API surface; the project guide names only where they live. A
domain-specific utility stays local until a second package truly needs it. Changing the primitives
is an architecture decision.

## 7.7 TypeScript Strictness

Non-negotiable: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Never bypass
with `any`, `@ts-ignore`, unsafe non-null assertions, or `as unknown as T`. Narrow `unknown` before
use. Exported callable interfaces use function properties, not method syntax, so strict parameter
variance applies.

## 7.8 Root Changes

No new dependencies, packages, root-config changes, or build/test/lint behavior changes without
explicit task scope or an ADR-level reason.

## 7.9 Shared Vocabulary

Consult the project glossary before naming domain APIs or docs; add durable vocabulary there, or
write an inbox entry when a term needs curation. Any concept touched by two workspaces, commands, or
docs gets one shared definition — never a parallel name for something the glossary already owns.
