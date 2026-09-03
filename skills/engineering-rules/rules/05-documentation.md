# 05 Documentation

Document why, constraints, contracts, and non-obvious behavior. Never restate code.

## 5.1 File Preambles

Repository-owned source and test files carry a brief preamble stating durable responsibility and
domain context; generated and vendored sources are exempt. Package entrypoints also explain the
public API with a small example once behavior exists. The project guide owns the preamble schema;
mechanical validation enforces presence, review owns accuracy.

## 5.2 Public APIs

Public package APIs, exported schemas, commands, and non-obvious exports need meaningful JSDoc;
self-explanatory internal exports need none. Document what applies: formats, ranges, units,
defaults; auth/provider/environment assumptions; idempotency and retry behavior; expected `Result`
errors; invariant throws; side effects; external state and cleanup semantics.

Types replace redundant JSDoc param/return annotations. `@throws {ErrorType}` only for
invariant/programmer-error throws; `@example` when usage is non-obvious. Document known abstraction
leaks (pagination slowdowns, rate limits the adapter absorbs) in `@remarks`.

Bad: `@param id - The id` Good:
`@param pageId - Stable page ID from the source CMS; path aliases must be resolved before calling.`

## 5.3 Internal Comments

Comment only the non-obvious: domain rules, algorithm steps, workarounds, magic numbers and regexes,
security constraints, protocol quirks, concurrency/idempotency assumptions. Never narrate
assignments or framework boilerplate. Non-exported functions need JSDoc only when they contain
`invariant()`, return `Result`, are called from multiple files, or are not self-explanatory.

When changing nuanced code, review nearby comments as part of the edit — a stale comment is a
failing contract for future agents.

## 5.4 Package READMEs

Every workspace README states the package contract, covering every declared export and subpath. Use
the package-readme template the project guide names, and update the README when inter-workspace
APIs, schemas, commands, side effects, or relied-on capabilities change. Commands go in a
`Command | Use` table — agents should not infer whether a command is setup, iteration, final
validation, or expensive/live.

## 5.5 Durable Docs

Code, tests, and docs move together. The project guide names each location; update: the guide itself
(only when the map, commands, or rule translation changes), topic pages for compiled knowledge,
architecture notes for boundaries, the glossary for vocabulary, decision records for planning,
package READMEs for contracts, the learnings inbox for raw discoveries.

A behavior change is incomplete while any public contract, README, topic page, or guide teaches old
behavior. At significant chunk end, sweep the inbox, glossary, affected READMEs, and topic pages —
update only what became stale or newly knowable.

No competing sources of truth: work artifacts link to topic pages and decision records rather than
restating them; procedures route from the project guide instead of being pasted into several places.

## 5.6 Review Rule

Block junk docs as you block missing docs: documentation that lies or restates names is worse than
none, because agents will trust it.
