# engineering-rules

A generic, distilled engineering ruleset for TypeScript monorepos, packaged as an agent skill: 13
rules (~5,900 words) behind a trigger-routing index, one editable per-project translation file (the
project guide), and two commands to create and audit it.

Sources distilled: tiger-style, design-by-contract, railway-oriented programming and result types,
Ousterhout's deep modules, behavioral TDD/BDD, DORA capabilities, DDIA-style data modeling,
twelve-factor/serverless practice — with recorded calibrations where this ruleset deliberately
deviates (coverage as signal, tool-native over zero-dependency).

## Install

```sh
npm i -D @tenets/skills && npx skills experimental_sync
# or: skills add BarakChamo/tenets
```

Then in the target repository run `/rules-init` (optionally `/rules-init path/to/guide.md`). It
writes the project guide, pre-filled from the repo, and pins two lines in AGENTS.md: the
`Project guide:` path and the routing imperative that makes index loading deterministic. Audit or
upgrade later with `/rules-check`.

## Contract the project must satisfy

Rules never change per project; the guide carries everything project-specific. Two things are fixed
by the rules themselves (Rule 7.6):

- `Result<T, E>` / `ResultAsync<T, E>` with `ok`, `err`, and consumed-result semantics,
- `invariant(condition, message)` throwing `InvariantError`.

Ship those exact APIs in any package you like and name their location in the guide. This repository
provides them as `@tenets/result` and `@tenets/invariant` under `packages/` — copy them in
or depend on them directly.

## Layout

- `SKILL.md` — the routing index; loads on trigger, points to one rule file per situation.
- `rules/` — 13 rule files, stable section anchors (`Rule 4.3`); anchors never renumber.
- `templates/project-guide.md` — the editable translation template (WHAT/WHY/QUALITY BAR per slot).
- `command/` — `/rules-init`, `/rules-check`.

## Determinism

Skill activation is description-matched and therefore probabilistic; two layers make routing
near-deterministic, measured at 18/18 rule-loading under adversarial minimalism hooks:

1. The AGENTS.md mandate `/rules-init` writes (read index → Read matched rules → open the response
   with `Rules: <numbers|none>`; overrides brevity/minimalism instructions).
2. The index's own loading protocol with the same declaration.

Teams wanting a hard per-prompt guarantee can add a project hook (`.claude/settings.json`) — at the
cost of `Rules: none` announcements on non-code prompts:

```json
{
	"hooks": {
		"UserPromptSubmit": [
			{
				"hooks": [
					{
						"type": "command",
						"command": "echo 'engineering-rules: for code work, read the skill index, Read matched rules, open with Rules: <numbers|none>.'"
					}
				]
			}
		]
	}
}
```
