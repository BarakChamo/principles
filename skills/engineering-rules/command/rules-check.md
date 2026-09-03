---
description:
  Audit the engineering-rules project guide for completeness, staleness, and rule-anchor validity.
  Use when the user runs /rules-check, after refactors that change commands or workspaces, or when
  upgrading the engineering-rules skill.
---

# /rules-check

Audit this repository's engineering-rules project guide.

Locate it via the `Project guide:` line in AGENTS.md/CLAUDE.md (default `docs/project-guide.md`);
missing guide → report that and suggest `/rules-init`.

## Checks

1. **Structure:** every template heading present (compare against `templates/project-guide.md` in
   the `engineering-rules` skill); `Template-Version` stamp matches the skill's
   `metadata.template-version` — mismatch means re-run `/rules-init` against the new template.
2. **Freshness:** every command in the guide exists in root `package.json`; every workspace in the
   map exists; primitive and store locations resolve; the stated test runner and suffixes match real
   test files.
3. **Quality bars:** each section satisfies its QUALITY BAR from the template; the guide stays under
   ~600 words; no section restates what code, README, or rules already say.
4. **Anchors:** every `Rule N.M` the guide cites exists in the skill's rule files.
5. **Deviations:** the section is present and explicit (`none recorded` counts); flag any known
   divergence between repo practice and the rules that is not recorded there.

Report findings as a checklist with pass/fail per check and a fix list, most severe first. Apply
fixes only when asked.
