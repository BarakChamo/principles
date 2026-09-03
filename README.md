# engineering-rules

A generic, distilled engineering ruleset for TypeScript monorepos, packaged as an agent skill:
13 rules (~5,900 words) behind a trigger-routing index with a measured loading protocol, one
editable per-project translation file (the project guide), two setup/audit commands, and an eval
suite.

Distilled from tiger-style, design-by-contract, railway-oriented programming and result types,
Ousterhout's deep modules, behavioral TDD/BDD, DORA capabilities, DDIA-style data modeling, and
twelve-factor/serverless practice — with recorded calibrations where the set deliberately deviates
(coverage as signal, tool-native over zero-dependency).

## Install

```sh
skills add BarakChamo/engineering-rules
```

Then, in the target repository, run `/rules-init` (optionally `/rules-init path/to/guide.md`). It
inspects the repo, writes a pre-filled project guide, and pins the routing mandate into AGENTS.md —
the always-loaded line that makes rule loading deterministic. Audit or upgrade later with
`/rules-check`.

## How it works

- **Rules never change per project.** Every project-specific fact lives in the project guide
  (default `docs/project-guide.md`, custom path recorded on the `Project guide:` line in AGENTS.md).
- **Routing**: the skill index maps task triggers to rule files; agents Read only the 2–4 rules a
  task needs (~1.5–2.5k tokens). Section anchors (`Rule 4.3`) are stable identifiers.
- **Loading protocol**: match rows → Read every matched rule file → open the response with
  `Rules: <numbers|none>`. Measured 18/18 correct rule loading under adversarial minimalism hooks,
  with negatives staying silent (see `evals/`).

## Required API surface

Two primitives are fixed by the rules (Rule 7.6); ship them in any package and name the location in
the guide:

- `Result<T, E>` / `ResultAsync<T, E>` with `ok`, `err`, and consumed-result semantics,
- `invariant(condition, message)` throwing `InvariantError`.

Reference implementations (MIT, dependency-free): [`reference/result.ts`](reference/result.ts) and
[`reference/invariant.ts`](reference/invariant.ts) — copy them into a workspace as-is.

## Layout

| Path                                    | Contents                                              |
| --------------------------------------- | ------------------------------------------------------ |
| `skills/engineering-rules/SKILL.md`     | Routing index, loading protocol, guide discovery       |
| `skills/engineering-rules/rules/`       | The 13 rule files                                      |
| `skills/engineering-rules/templates/`   | Project-guide template (WHAT/WHY/QUALITY BAR per slot) |
| `skills/engineering-rules/command/`     | `/rules-init`, `/rules-check`                          |
| `reference/`                            | Result and invariant reference implementations         |
| `evals/`                                | Routing eval runner + 17 scenarios                     |
| `examples/project-guide-example.md`     | A real populated guide                                 |

## Evals

```sh
evals/run.sh /path/to/repo-with-skill-installed
```

Runs 14 positive scenarios (one per rule row plus a mechanical micro-task) and 3 negatives through
fresh non-interactive sessions, asserting the index loads, the expected rule file is Read, and
non-engineering prompts stay silent. Run it before releasing any change to the skill description or
index. Requires an authenticated `claude` CLI; each run costs real tokens.

## Determinism

Skill activation is description-matched and therefore probabilistic; two layers make routing
near-deterministic: the AGENTS.md mandate `/rules-init` writes, and the index's own loading
protocol with the `Rules:` declaration — both stating explicitly that brevity/minimalism
instructions govern prose, never the protocol. Teams wanting a hard per-prompt guarantee can add
the optional hook documented in `skills/engineering-rules/README.md`, at the cost of `Rules: none`
announcements on non-code prompts.

## License

MIT.
