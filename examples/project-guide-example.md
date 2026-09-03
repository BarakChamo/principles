# Project guide

<!-- Example: the populated guide of the monorepo this skill was developed in. -->

Template-Version: 1

Translates the generic engineering rules (`skills/engineering-rules/`) into this repository.
Normative requirements: [requirements](../requirements.md) (wins on conflict).

## Stack

- Bun 1.4 — package manager and command entry point only; application code runs on Node.js 24 with
  no Bun APIs ([ADR 0001](../adr/0001-workspace-families.md)).
- TypeScript 7 (strict profile in `tsconfig.base.json`), Next.js App Router, Turborepo.
- Vercel Services deployment ([ADR 0002](../adr/0002-vercel-services.md)); workspaces export
  TypeScript source, apps compile them via `transpilePackages`
  ([ADR 0003](../adr/0003-source-imports.md)).

## Commands

| Command                       | Use                                                                  |
| ----------------------------- | -------------------------------------------------------------------- |
| `bun install`                 | Setup; CI uses `--frozen-lockfile`                                   |
| `bun run dev:services`        | Deployment-shaped stack at `https://boilerplate.workspace.localhost` |
| `bun run dev`                 | Apps directly at `https://<app>.workspace.localhost`                 |
| `bun run check`               | **The acceptance gate** — required before any commit                 |
| `bun run test`                | Behavioral tests only                                                |
| `bun run format` / `lint:fix` | Apply formatting / safe lint fixes                                   |
| `bun run cache:clean`         | Evict Turborepo cache artifacts older than 14 days                   |
| `bun run deploy`              | **Live** — preview deployment; needs a linked Vercel project (human) |

## Workspace map

Namespace `@workspace/*`; directions (apps → packages+libs; packages → packages; libs → libs)
enforced by `turbo boundaries`.

| Workspace              | Family  | Owns                                                     |
| ---------------------- | ------- | -------------------------------------------------------- |
| `@workspace/web`       | app     | Root UI at `/`, same-origin `/gateway/*` boundary        |
| `@workspace/api`       | app     | `/api` service info, health, greeting Route Handlers     |
| `@workspace/ops`       | app     | `/ops` operational UI and health with degraded reporting |
| `@workspace/greetings` | package | Public greeting operation with typed recoverable failure |
| `@workspace/text`      | lib     | Display-name normalization                               |
| `@workspace/env`       | lib     | Typed environment contracts and validators (Zod 4.5)     |
| `@workspace/result`    | lib     | `Result`/`ResultAsync` primitives                        |
| `@workspace/invariant` | lib     | `invariant` + `InvariantError`                           |

## Shared primitives

`Result`/`ResultAsync`/`ok`/`err` → `@workspace/result`; `invariant` + `InvariantError` →
`@workspace/invariant`; boundary schemas → Zod 4.5 through `@workspace/env` (re-exports `z`).
Environment variables are declared and parsed in the owning workspace's `src/env.ts`.

## Tests

Vitest, explicit imports. Suffixes: `.unit.test.ts`, `.integration.test.ts`, `.live.test.ts`,
`.e2e.test.ts`; compile-time contracts in `.test-d.ts` (verified by `typecheck`). Tests sit beside
the owning workspace's source; `bun run test` runs all, per-workspace `bun run test` scopes.

## Documentation map

Preambles: one-line `/** @description ... */` at file top. Templates: `docs/templates/`
(implementation-plan, package-readme, learning). Topic pages: none yet — create under `docs/` when
compiled knowledge exists. Architecture: `docs/architecture/overview.md` +
`docs/work/architecture.md`. Glossary: `docs/work/glossary.md`. Decisions: `docs/adr/`, plans in
`docs/work/decisions/`. Inbox: `docs/work/inbox/`.

## Vocabulary

`docs/work/glossary.md` — includes service binding, gateway route, degraded result, acceptance gate.

## Data and runtime

No store yet: no system of record, KV, analytics, or blob storage exists in this boilerplate.
Platform: Vercel Fluid Compute (Node.js), 300s default timeout; local dev behind portless-named
`.localhost` origins, branch-prefixed in git worktrees. Cache layers available: CDN, Next.js data
cache, per-request memoization; no application KV. Turborepo cache is shared across worktrees.

## Change delivery

Trunk on `main`; commits imperative with the why, no conventional-commit prefixes. No feature-flag
tooling yet — isolate unfinished work by leaving it unwired. Observability: OpenTelemetry via
`@vercel/otel` (distinct service name per app), Vercel Analytics + Speed Insights in browser apps;
no logging library yet — Route Handlers return typed error bodies, no correlation-id mechanism.

## Rule addenda and recorded deviations

- 7.2/7.6: packages cannot depend on libs here, so `packages/*` only define their own small result
  unions as public contract (see `@workspace/greetings`). Apps and libs always use
  `@workspace/result` — never hand-rolled `{ ok: ... }` unions, even when imitating a package.
- 13: local dev runs behind the portless proxy; hostnames gain a branch prefix in worktrees.
