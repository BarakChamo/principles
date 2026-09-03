#!/bin/bash
# Routing eval runner for the engineering-rules skill.
#
# Usage: ./run.sh <target-repo> [scenarios.tsv] [results.txt]
#
# The target repo must have the skill installed (skills add, or a .claude/skills copy) and the
# AGENTS.md routing mandate in place (/rules-init writes it). Each scenario runs a fresh
# non-interactive session and records: whether the index/skill loaded, which rule files were read,
# and whether the response opened with the "Rules:" declaration.
#
# Requires: claude CLI (authenticated), python3.
set -u
REPO="${1:?target repo path}"
SCEN="${2:-$(dirname "$0")/scenarios.tsv}"
OUT="${3:-$(dirname "$0")/results.txt}"
: > "$OUT"
while IFS=$'\t' read -r ID EXPECT PROMPT; do
	[ -z "$ID" ] && continue
	case "$ID" in \#*) continue ;; esac
	RAW="$(dirname "$OUT")/raw-$ID.jsonl"
	(cd "$REPO" && claude -p "$PROMPT" --model sonnet --max-turns 6 --output-format stream-json \
		--verbose --disallowedTools Edit,Write,Bash,WebFetch,WebSearch) > "$RAW" 2>/dev/null
	python3 - "$OUT" "$ID" "$EXPECT" "$RAW" <<'PY'
import json, sys, re
out, id_, expect, raw = sys.argv[1:5]
skill = 0; reads = set(); res = ''
for line in open(raw):
    try: d = json.loads(line)
    except Exception: continue
    if d.get('type') == 'assistant':
        for b in d['message'].get('content', []):
            if b.get('type') == 'tool_use':
                i = b.get('input', {})
                if b['name'] == 'Skill' and i.get('skill') == 'engineering-rules': skill += 1
                fp = str(i.get('file_path', ''))
                if 'engineering-rules' in fp:
                    m = re.search(r'rules/(\d+)', fp)
                    if m: reads.add(m.group(1))
                    if 'SKILL.md' in fp: reads.add('IDX')
    if d.get('type') == 'result': res = str(d.get('result') or '')
decl = 'Y' if re.search(r'Rules?:\s*(\d|none)', res) else 'N'
idx = 'Y' if (skill or 'IDX' in reads) else 'N'
rules_read = sorted(r for r in reads if r != 'IDX')
ok = 'PASS' if (expect == 'none' and idx == 'N' and not rules_read) or \
     (expect != 'none' and idx == 'Y' and (expect == 'any' or any(e in rules_read for e in expect.split(',')))) else 'FAIL'
with open(out, 'a') as f:
    f.write(f"{ok}|{id_}|expect={expect}|idx={idx}|rules={','.join(rules_read) or '-'}|decl={decl}\n")
PY
done < "$SCEN"
sort "$OUT"
echo "---"
grep -c '^PASS' "$OUT" | xargs -I{} echo "passed: {} / $(grep -cve '^\s*$' -e '^#' "$SCEN")"
