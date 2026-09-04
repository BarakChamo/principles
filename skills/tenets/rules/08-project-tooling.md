# 08 Project Tooling

Use documented repository-owned commands; normal work never depends on undocumented global tools or
ad hoc command variants. The project guide owns the tool stack, command table, and current package
naming — reference examples naming other tools are examples, not repo facts. This rule carries
policy only.

Root scripts stay focused on human-facing repo actions; orchestration internals live behind package
commands or tool config. Engineering rules own intent, ADRs own calibrated decisions, tool config
owns mechanical enforcement, repository policy checks own cross-file policy — resolve disagreements
centrally, never with local suppressions. Prefer native tool capabilities before custom enforcement;
policy code is reserved for deterministic rules existing tools cannot express.

## 8.1 Command Surface Expectations

- one command per common action,
- no hidden global dependencies, no required flags for normal checks,
- readable streaming output,
- deterministic setup through documented install commands.

The declared task graph is the impact and cache authority: routine validation covers affected
components and downstream consumers, with accurate source, dependency, and config inputs. Finish
source-writing fixes before parallel read-only checks; keep validation, tests, and builds distinct
phases (scoped runs: Rule 04.8).

## 8.2 Automated Feedback Hooks

Hooks give automatic feedback while work is active: frequent hooks stay cheap and scoped; broader
validation belongs at phase boundaries. Hooks never run integration or E2E — those touch external
systems and require an intentional decision. Ordinary linting, testing, and builds stay out of
repository policy tooling.

## 8.3 Config Rules

- Prefer JSONC where comments help agents understand config.
- Keep cache declarations accurate and generated/local-state exclusions aligned across tools.
- Prefer native rules and dependency analysis before syntax-tree analysis; never duplicate native
  checks without measured justification.
- Routine automated writes stay behavior-preserving; unsafe fixes require intentional review and
  targeted behavioral tests.
- Update policy checks when adding required docs or workspace files.
- Add reasonable tool dependencies instead of building workarounds around their absence.
