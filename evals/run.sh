#!/bin/bash
# Eval runner for the tenets skill.
#
# Usage: ./run.sh <target-repo> [scenarios.tsv] [results.txt]
#
# The target repo must have the skill installed (skills add, or a .claude/skills copy) and the
# AGENTS.md routing mandate in place (/tenets-init writes it). Each scenario runs a fresh
# non-interactive session and records: whether the index/skill loaded, which rule files were read,
# whether the language profile was read, and whether the response opened with the "Rules:"
# declaration.
#
# Scenario columns (tab separated): id, expected-rules (any|none|csv), prompt, and an optional
# require-regex that the response text must match — that column turns a routing scenario into a
# rule-abidance scenario.
#
# Requires: claude CLI (authenticated), python3.
set -u
REPO="${1:?target repo path}"
SCEN="${2:-$(dirname "$0")/scenarios.tsv}"
OUT="${3:-$(dirname "$0")/results.txt}"
: > "$OUT"
while IFS=$'\t' read -r ID EXPECT PROMPT REQUIRE; do
	[ -z "$ID" ] && continue
	case "$ID" in \#*) continue ;; esac
	RAW="$(dirname "$OUT")/raw-$ID.jsonl"
	(cd "$REPO" && claude -p "$PROMPT" --model sonnet --max-turns "${EVAL_MAX_TURNS:-6}" \
		--output-format stream-json \
		--verbose --disallowedTools Edit,Write,Bash,WebFetch,WebSearch) > "$RAW" 2>/dev/null
	python3 - "$OUT" "$ID" "$EXPECT" "$RAW" "${REQUIRE:-}" <<'PY'
import json, sys, re
out, id_, expect, raw, require = sys.argv[1:6]
fired = set(); reads = set(); res = ''; texts = []
for line in open(raw):
    try: d = json.loads(line)
    except Exception: continue
    if d.get('type') == 'assistant':
        for b in d['message'].get('content', []):
            if b.get('type') == 'text': texts.append(b.get('text', ''))
            if b.get('type') == 'tool_use':
                i = b.get('input', {})
                if b['name'] == 'Skill': fired.add(str(i.get('skill', '')))
                fp = str(i.get('file_path', ''))
                # Only the ruleset skill's own directory counts as a rule read: a workflow skill
                # reading ../tenets/rules/03-*.md must not be credited as the index routing there.
                if re.search(r'(?:^|/)tenets/', fp):
                    m = re.search(r'rules/(\d+)', fp)
                    if m: reads.add(m.group(1))
                    if re.search(r'(?:^|/)tenets/SKILL\.md$', fp): reads.add('IDX')
                    if '/profiles/' in fp: reads.add('PROF')
    if d.get('type') == 'result': res = str(d.get('result') or '')
res = res or '\n'.join(texts)  # a max-turns run has no result field; fall back to assistant text
decl = 'Y' if re.search(r'Rules?:\s*(\d|none)', res) else 'N'
idx = 'Y' if ('tenets' in fired or 'IDX' in reads) else 'N'
prof = 'Y' if 'PROF' in reads else 'N'
rules_read = sorted(r for r in reads if r not in ('IDX', 'PROF'))
workflow = sorted(s for s in fired if s.startswith('tenets-'))
# Expectation forms: none | any | <rule csv> | skill:<name> | no-workflow
if expect.startswith('skill:'):
    # Alternatives separated by '|': skill:<name> or rule:<NN>. A request that the ruleset answers
    # correctly on its own (Rule 14 planning, say) is not a routing failure.
    alts = expect.split('|')
    routed = any((a.split(':', 1)[1] in fired) if a.startswith('skill:')
                 else (a.split(':', 1)[1] in rules_read) for a in alts)
elif expect == 'no-workflow':
    routed = not workflow
elif expect == 'none':
    routed = idx == 'N' and not rules_read and not workflow
else:
    matched = expect == 'any' or any(e in rules_read for e in expect.split(','))
    # A workflow skill firing on an ordinary routing scenario is cannibalization, not a pass.
    routed = idx == 'Y' and matched and not workflow
req = '-' if not require else ('Y' if re.search(require, res, re.I | re.S) else 'N')
ok = 'PASS' if (routed and req != 'N') else 'FAIL'
with open(out, 'a') as f:
    f.write(f"{ok}|{id_}|expect={expect}|idx={idx}|rules={','.join(rules_read) or '-'}"
            f"|wf={','.join(workflow) or '-'}|prof={prof}|decl={decl}|req={req}\n")
PY
done < "$SCEN"
sort "$OUT"
echo "---"
grep -c '^PASS' "$OUT" | xargs -I{} echo "passed: {} / $(grep -cve '^\s*$' -e '^#' "$SCEN")"
