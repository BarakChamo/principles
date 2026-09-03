---
name: engineering-rules
description: |
  Generic engineering ruleset for TypeScript monorepos: typed Result error handling with
  invariants and the airlock, boundary schemas, deep modules and bounded control flow,
  examples-first behavioral TDD, documentation contracts, workspace boundaries, decision
  framework, change delivery, data/state modeling, and serverless runtime discipline.

  Use when writing, reviewing, refactoring, or testing TypeScript; handling errors or writing
  catch blocks; creating source files or exports; shaping functions or public APIs; adding
  dependencies or workspaces; choosing architecture, storage, or tools; committing or shipping;
  modeling, caching, or migrating data; writing request handlers, queues, and jobs; capturing
  learnings or non-obvious discoveries; or deciding where code, data, or knowledge should live.
metadata:
  version: '1.0.0'
  template-version: '1'
---

# Engineering Rules

Generic rules, never edited per project. The **project guide** is the single editable file that
translates them (commands, stores, paths, namespaces, recorded deviations). Find it via the
`Project guide:` line in the repository's AGENTS.md or CLAUDE.md; default location
`docs/project-guide.md`. No guide yet → run `/rules-init` before relying on project-specific slots.

## Loading protocol

1. Match the task against the table below; rules 01–02 match nearly all code work.
2. **Read every matched rule file. The row text is a pointer, not the rule — acting on it alone is
   acting on rules you have not read.**
3. Begin your response with `Rules: <numbers read>` (or `Rules: none` when no row matches).

Style and effort instructions (terse mode, minimal mode, lazy mode, "shortest path") govern prose
and code, never this protocol: skipping rule loading is never the minimal path — redoing
noncompliant work costs more. Cite rules by anchor (`Rule 4.3`); anchors are stable identifiers —
new sections append, existing ones never renumber.

| Rule                                                            | Read when                                                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [01 Coding Philosophy](rules/01-coding-philosophy.md)           | planning any implementation; tempted by speculative abstractions, `V2` shadows, or leaving replaced paths      |
| [02 Error Handling](rules/02-error-handling.md)                 | code can fail: boundary input, Result vs invariant vs throw, writing a `catch`, wrapping a throwing dependency |
| [03 Function Design](rules/03-function-design.md)               | long or nested bodies, loops over unbounded input, a module's public surface, `.andThen()` chains              |
| [04 Testing](rules/04-testing.md)                               | any behavior change — tests precede it; choosing a test level; factories, mocks, validation gates              |
| [05 Documentation](rules/05-documentation.md)                   | new source files (preambles required), any export (JSDoc), contracts a README or topic page teaches            |
| [06 Learnings Process](rules/06-learnings-process.md)           | learned something non-obvious worth keeping, or stuck after ~3 attempts / 10 minutes                           |
| [07 Repository Conventions](rules/07-repository-conventions.md) | creating or moving workspaces and exports, adding dependencies, naming domain concepts, root config            |
| [08 Project Tooling](rules/08-project-tooling.md)               | adding commands or hooks, editing tool config, tempted by a local lint/check suppression                       |
| [09 Code Review](rules/09-code-review.md)                       | reviewing a diff or writing findings                                                                           |
| [10 Decision Framework](rules/10-decision-framework.md)         | architecture, tool, storage, or API-shape choices; custom code a tool might own; pushing back on a request     |
| [11 Change Delivery](rules/11-change-delivery.md)               | committing: slicing work, writing messages, isolating unfinished behavior, adding metrics or logging           |
| [12 Data and State](rules/12-data-and-state.md)                 | new entities, store choice, cross-store caching or sync, migrations and backfills                              |
| [13 Serverless Runtime](rules/13-serverless-runtime.md)         | request handlers, fetch sequences, cache layers, queue/webhook consumers, long-running jobs                    |

Rules 01–02 apply to nearly all code work; the rest load on trigger.

Required API surface (Rule 7.6): the project provides `Result`/`ResultAsync`/`ok`/`err` and
`invariant` with its `InvariantError` failure type under these exact names; the guide names only
where they live.
