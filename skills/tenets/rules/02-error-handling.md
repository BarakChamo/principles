# 02 Error Handling

Every failure starts in exactly one tier; a boundary parse failure may then be translated into a
typed `Result` error for the public contract.

## 2.1 Tier 1: Boundary Validation

Use schemas wherever data enters a trust boundary: HTTP/RPC/tool/CLI/SDK/worker/adapter inputs,
provider responses, file contents, environment variables, URL and query params, and public package
functions called from another workspace.

Parse, do not cast: use the schema's non-throwing parse API (the profile names it), then use the
parsed value. The package that owns a
public operation owns and exports its schema.

## 2.2 Tier 2: Invariants and the Airlock

`invariant(condition, message)` is only for states impossible in correct code: corrupted internal
state, an impossible union branch, data missing after validation guaranteed it, a violated
postcondition after a trusted operation.

Invariant failures throw. They are programmer bugs, never caught to recover — catching one and
continuing launders a bug into normal control flow.

Assert both ends of an interaction (the airlock):

- **Entry:** preconditions at the top, with validation.
- **Exit:** postconditions and re-established invariants before return, when a trusted operation
  makes a promise worth checking.
- **Critical call sites:** a caller that cannot tolerate a broken promise asserts what it received.

Messages name the violated expectation. Density is a review signal, not a quota: assert non-obvious
relationships; a simple pure transform needs nothing.

Example: `invariant(imported.count === manifest.count, 'import postcondition violated')` after a
trusted import marks an implementation bug, not a recoverable import error.

## 2.3 Tier 3: Expected Failures

Use `Result<T, E>` / `ResultAsync<T, E>` for recoverable workflow and domain failures — not found,
unauthorized, conflict, provider timeout, rate limit, storage write failure, unsupported capability.
Each error is a discriminated object with a `type` field and context enough for callers and tests.
Service/domain layers compose `Result` values; app wrappers stay thin and map them at the edge (Rule
03.2).

Exception-native dependencies (SDKs, CLIs, synchronous parsers) get a judgment call at their seam,
decided by whether the caller can act on the failure: wrap the throw into a typed `Result` when the
workflow retries, branches on, or degrades around it; let it propagate when no caller can
meaningfully handle it. Decide once at the adapter boundary and record it in the adapter's contract
— no false `Result` surfaces, no expected failures escaping as untyped throws.

## 2.4 Prohibitions

- No bare string errors, and no type-system bypasses (Rule 07.7).
- No untyped expected throws; no throwing across a recoverable workflow contract.
- No `try/catch` for business branching; no swallowed errors.
- No dropped `Result`: each one is matched, mapped, returned, or explicitly unwrapped.
- No recovering from an invariant failure; a translation `catch` rethrows anything outside the
  boundary's declared error contract.
- No `null`/`undefined` for known failure states.
- No manual string checks where a schema owns the boundary; no provider errors passed through as
  user-facing strings.

## 2.5 Decision Flow

- Untrusted or boundary-crossing data? Schema validation.
- Impossible if the code is correct? `invariant()`.
- Caller can recover or choose a path? Typed `Result`.
- A declared exception-throwing boundary? Throw there; translate at the recovery boundary.
- None of the above? Re-check the contract before coding.

When a provider/tool throws, catch at the adapter boundary, filter, and translate once (the profile
shows the shape): rethrow an invariant failure unchanged — it is a programmer bug, never laundered
into a recoverable error — and return a typed error carrying the failure kind, the provider
identity, and the original cause.

## 2.6 Tests Required

Per `Result`-returning function: one happy-path test, one behavioral test per documented error type,
invariant throw tests where invariants exist, schema rejection tests at boundaries.
