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
2. Inspect the repository and pre-fill every slot you can prove: package manager and runtime
   (lockfiles, `engines`), commands (root `package.json` scripts — mark the acceptance gate and any
   live/expensive commands), workspaces and namespace (manifests), dependency enforcement
   (task-runner config), primitive locations (search for `Result`, `invariant`, the schema library),
   test runner and suffixes (configs and existing test filenames), tsconfig strictness, stores and
   platform (deps and deploy config), observability tooling.
3. Write the guide at the target path: template headings verbatim, comments replaced by content —
   one line per fact, under ~600 words total. A slot the repo cannot answer yet gets an explicit
   placeholder naming what is missing (for stores: state "no store yet" explicitly). Keep the
   deviations section, `none recorded` when empty. Stamp `Template-Version: 1` under the title.
4. Write `tenets.json` at the repository root: `{ "guide": "<target path>" }` (merge into an
   existing file rather than clobbering other fields). This is the self-contained discovery record;
   it survives skill reinstalls because it is repo-owned.
5. Ensure AGENTS.md (or CLAUDE.md if the repo has no AGENTS.md) carries the routing mandate: read
   the skill index, Read the matched rule files, open responses with `Rules: <numbers|none>`,
   overriding brevity/minimalism instructions. The mandate needs an always-loaded file; guide
   discovery does not.
5. The AGENTS.md routing line must include the full protocol: read the index, Read the matched rule
   files, and open responses with `Rules: <numbers|none>`, stating that this overrides
   brevity/minimalism instructions.
6. Self-check every section against its QUALITY BAR from the template; fix or flag failures.
7. Offer (do not apply unasked) the optional per-prompt determinism hook from the skill README.
8. Report: the guide path, slots filled vs flagged, and the AGENTS.md lines written.
