# 06 Learnings Process

Learnings capture non-obvious operational knowledge. Incidental discoveries stay in the learnings
inbox (location in the project guide) until a deliberate compilation pass promotes them into a topic
page, the glossary, or a decision record.

## 6.1 When to Capture

Capture what a future agent could not infer from code, tests, or durable docs: surprising command or
CI behavior, a hidden utility, a package gotcha, a debugging root cause, a provider quirk, a rabbit
hole to avoid, reviewer feedback revealing a missing convention. Skip general TypeScript knowledge,
obvious behavior, and notes with no future value.

## 6.2 Rabbit Hole Protocol

After three failed approaches, ~10 minutes of progress-free debugging, guessing, or on the verge of
changing root config/dependencies/architecture:

1. stop,
2. capture what you learned in the inbox as `YYYYMMDD-HHMM-short-slug.md`,
3. ask for guidance with specific options,
4. wait.

This is the one stop-and-capture trigger; Rule 10.6 applies it before architectural pivots.

## 6.3 Entry Format

Use the learning template the project guide names: context, learning, action, promotion target — one
discovery per file, timestamped filenames so parallel agents cannot conflict.

"The vendor CLI emits malformed JSON on version X" is an inbox entry until compiled; "all adapters
must return typed Result errors" belongs in rules or a compiled contract page. Never link inbox
entries from topic pages or the project guide — compiled docs stay clean; raw notes stay
discoverable through their folder.

## 6.4 Curation

During normal work, capture freely and leave unrelated learnings alone. When explicitly asked to
curate: promote durable facts to the right topic page, rule, or README; archive or delete entries
once represented; remove learnings staled by changed commands, paths, or behavior.

When your change renames commands, paths, packages, or behavior, scan topic pages and work docs for
affected context — stale compiled knowledge is worse than none. Rules and compiled docs override
inbox entries; a learning never justifies violating a rule.
