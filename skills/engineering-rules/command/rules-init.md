---
description:
  Populate the engineering-rules project guide from the repository. Use when setting up the
  engineering-rules skill in a repo, creating or regenerating the project guide, or when the user
  runs /rules-init, optionally with a custom path argument.
---

# /rules-init

Populate the engineering-rules project guide for this repository.

Target path: `$ARGUMENTS` if given, else the `guide` field of an existing `tenets.json`, else the
`Project guide:` line in AGENTS.md/CLAUDE.md, else `docs/project-guide.md`.

## Steps

1. Load the `engineering-rules` skill and read `templates/project-guide.md` next to it.
2. Detect the language profile: pick the `profiles/<name>.md` file matching the repository's
   dominant language and ecosystem, default `typescript`. If no shipped profile fits, say so and
   stop — a new profile is an authoring task, not a guide slot.
3. Inspect the repository and pre-fill every slot you can prove: package manager and runtime
   (lockfiles, `engines`), commands (root manifest scripts — mark the acceptance gate and any
   live/expensive commands), workspaces and namespace (manifests), dependency enforcement
   (task-runner config), primitive locations (search for the profile's primitive names), test runner
   and suffixes (configs and existing test filenames), stores and platform (deps and deploy config),
   observability tooling. Ecosystem-wide facts the profile already fixes — strictness settings, doc
   tags, test declaration form — do not go in the guide.
4. Write the guide at the target path: template headings verbatim, comments replaced by content —
   one line per fact, under ~600 words total. A slot the repo cannot answer yet gets an explicit
   placeholder naming what is missing (for stores: state "no store yet" explicitly). Keep the
   deviations section, `none recorded` when empty. Stamp `Template-Version: 1` under the title.
5. Write `tenets.json` at the repository root:
   `{ "guide": "<target path>", "profile": "<profile name>" }` (merge into an existing file rather
   than clobbering other fields). This is the self-contained discovery record; it survives skill
   reinstalls because it is repo-owned. Omit `profile` only when it is `typescript`, the default.
6. Ensure AGENTS.md (or CLAUDE.md if the repo has no AGENTS.md) carries the routing mandate: read
   the skill index, Read the matched rule files and the language profile, open responses with
   `Rules: <numbers|none>`, stating that this overrides brevity/minimalism instructions. The mandate
   needs an always-loaded file; guide and profile discovery do not.
7. Self-check every section against its QUALITY BAR from the template; fix or flag failures.
8. Offer (do not apply unasked) the optional per-prompt determinism hook from the skill README.
9. Report: the guide path, the profile, slots filled vs flagged, and the AGENTS.md lines written.
