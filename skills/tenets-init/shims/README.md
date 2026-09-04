# Command shims

Two-line pointers that give a harness a typed entry point to a skill it cannot invoke by name. The
procedure stays in one place — the installed `SKILL.md` — so a shim can never drift from it.

Substitute `<name>` (for example `tenets-audit`) and `<summary>` (that skill's one-line purpose).
`/tenets-init` offers these only for harness directories a repository actually has.

Claude Code, Codex and Cursor need no shim: they read the skill directly and can type-invoke it
(`/tenets-audit`, `$tenets-audit`, `/tenets-audit` respectively).

## `.gemini/commands/<name>.toml`

Gemini CLI cannot type-invoke skills at all, and a markdown file in this directory is not
discovered — it must be TOML. See `gemini.toml`.

## `.opencode/commands/<name>.md`

opencode reaches skills only through its own skill tool, so a command file gives the user a typed
entry point. See `opencode.md`. Older versions used the singular `command/` directory — check the
installed version.

## `.clinerules/workflows/<name>.md`

Cline has workflows rather than skills. See `cline.md`.
