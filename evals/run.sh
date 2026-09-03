#!/bin/bash
# Eval runner for the engineering-rules skill.
#
# Usage: ./run.sh <target-repo> [scenarios.tsv] [results.txt]
#
# The target repo must have the skill installed (skills add, or a .claude/skills copy) and the
# AGENTS.md routing mandate in place (/rules-init writes it). Each scenario runs a fresh
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
skill = 0; reads = set(); res = ''; texts = []
for line in open(raw):
    try: d = json.loads(line)
    except Exception: continue
    if d.get('type') == 'assistant':
        for b in d['message'].get('content', []):
            if b.get('type') == 'text': texts.append(b.get('text', ''))
            if b.get('type') == 'tool_use':
                i = b.get('input', {})
                if b['name'] == 'Skill' and i.get('skill') == 'engineering-rules': skill += 1
                fp = str(i.get('file_path', ''))
                if 'engineering-rules' in fp:
                    m = re.search(r'rules/(\d+)', fp)
                    if m: reads.add(m.group(1))
                    if 'SKILL.md' in fp: reads.add('IDX')
                    if '/profiles/' in fp: reads.add('PROF')
    if d.get('type') == 'result': res = str(d.get('result') or '')
res = res or '\n'.join(texts)  # a max-turns run has no result field; fall back to assistant text
decl = 'Y' if re.search(r'Rules?:\s*(\d|none)', res) else 'N'
idx = 'Y' if (skill or 'IDX' in reads) else 'N'
prof = 'Y' if 'PROF' in reads else 'N'
rules_read = sorted(r for r in reads if r not in ('IDX', 'PROF'))
routed = (expect == 'none' and idx == 'N' and not rules_read) or \
         (expect != 'none' and idx == 'Y' and (expect == 'any' or any(e in rules_read for e in expect.split(','))))
req = '-' if not require else ('Y' if re.search(require, res, re.I | re.S) else 'N')
ok = 'PASS' if (routed and req != 'N') else 'FAIL'
with open(out, 'a') as f:
    f.write(f"{ok}|{id_}|expect={expect}|idx={idx}|rules={','.join(rules_read) or '-'}|prof={prof}|decl={decl}|req={req}\n")
PY
done < "$SCEN"
sort "$OUT"
echo "---"
grep -c '^PASS' "$OUT" | xargs -I{} echo "passed: {} / $(grep -cve '^\s*$' -e '^#' "$SCEN")"
