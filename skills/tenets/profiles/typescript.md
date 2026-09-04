# TypeScript Profile

The language profile binds rule vocabulary to one ecosystem. Rules state the principle, this file
states the mechanism, the project guide states the project's paths and commands. A profile may bind
rule terms to real names, append ecosystem rules, and waive a rule anchor with a stated reason; it
never contradicts a rule's intent.

Applies to: TypeScript and JavaScript, including Node.js and browser targets.

## Primitives (Rule 07.6)

Exact names: `Result<T, E>` / `ResultAsync<T, E>` with `ok()` / `err()` constructors, and
`invariant(condition, message)` throwing `InvariantError`. Typed errors are discriminated objects
with a `type` field. The project guide names the packages that provide them.

## Type system (Rules 07.7, 02.4, 09.1)

Non-negotiable compiler settings: `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`. Forbidden escape hatches, each a BLOCK finding: `any`, `@ts-ignore` /
`@ts-expect-error` on production code, non-null assertion (`!`) on untrusted or nullable values,
and `as unknown as T`. Narrow `unknown` before use. Exported callable interfaces use function
properties, not method syntax, so strict parameter variance applies.

## Boundaries (Rules 02.1, 01.3)

Parse with a schema library's non-throwing API (`safeParse`-style) and use the parsed value; derive
the static type from the schema (`z.infer`-style) so runtime and compile-time contracts cannot
drift. The project guide names the schema library.

## Translating a throwing dependency (Rule 02.5)

```ts
try {
	return ok(await codeHost.pullRequest(id));
} catch (error) {
	if (error instanceof InvariantError) {
		throw error; // programmer bug — never laundered into a recoverable error
	}
	return err({ type: 'code_host_unavailable', provider: 'github', cause: error });
}
```

## Idioms (Rules 03.4, 03.8)

Prefer `map` / `filter` / `flatMap`; use a named loop when `reduce` would obscure state. Immutability
means `const`, `readonly`, spreads, and non-mutating transforms (`toSorted` over `sort`). Ambient
access that belongs only in adapters: `process.env`, `console`, `process.exit`, `Date.now`,
`Math.random`.

## Tests (Rules 04.1, 04.6)

Import `describe` / `it` explicitly from the project's runner — never rely on globals. `describe`
names the public unit, `it` names observable behavior, Given/When/Then comments carry the example,
and rejection tests assert the message:

```ts
describe('Package.operation', () => {
	it('should return ConflictError when saving a stale draft', () => {
		// Given: a draft based on an outdated revision
		// When: the caller attempts the save
		// Then: save returns a typed conflict error
	});
});
```

## Documentation (Rules 05.2, 05.3)

JSDoc is the doc system: `@param`, `@returns`, `@throws {InvariantError}` for programmer-error
throws only, `@example` when usage is non-obvious, `@remarks` for known abstraction leaks,
`@internal` for test-only exports. Types replace redundant `@param` / `@returns` restatements.

## Packaging (Rules 07.1–07.3)

Implementation lives in `src/`. `package.json` `exports` is the public API; subpath exports carry
cohesive modules and broad root barrels are prohibited. Package-internal references may use
`imports` aliases such as `#internal/*`. Cross-workspace imports use the installed package name,
never a path into another workspace's `src`.

## Runtime (Rule 13)

Rule 13 applies to JavaScript serverless platforms: `Promise.all` for independent work, module-scope
client reuse, `after()`-style post-response hooks, streaming responses. The project guide names the
platform and its limits.

## Waivers

None — every rule anchor applies as written.
