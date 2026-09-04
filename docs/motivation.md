# Motivation: agents should be the best version of us

Every engineer has a best day. On that day you name the boundary before you write the function. You
notice that the failure you are about to swallow is a real branch a caller needs. You write the test
that would have caught the bug rather than the test that passes. You delete the abstraction you
built last week because the second use case never arrived. You leave a comment explaining the
constraint, not the syntax.

Nobody has that day every day. We ship at 5pm on a Friday, or after a bad night, or three weeks into
a deadline where every shortcut feels justified because the last one was. The gap between our best
work and our average work is not a knowledge gap — it is a discipline gap, and discipline is a
resource that depletes.

An agent has no bad days. It has no ego about the abstraction it wrote last week, no fatigue at the
fourth review comment, no sunk-cost attachment to the design it proposed an hour ago. What it lacks
is not capability but *taste that has been made explicit*. Left to infer standards from a codebase,
an agent will faithfully reproduce whatever is already there — including the parts you are ashamed
of. It is the most consistent junior engineer you will ever work with, and consistency without
direction just means the average gets reinforced.

That is the whole argument for writing this down. **An agent will be exactly as good an engineer as
the standard you managed to articulate.** Not as good as your best day, and not as good as your
intentions — as good as the sentences you actually wrote.

## The asymmetry that makes this urgent

Agents read and write more code than we do, faster, across more of the repository at once. Every
property of your codebase that lived in someone's head is now a property that gets diluted a little
with each change nobody checked against it.

Latent standards used to survive on social transmission: the reviewer who always asks "what happens
when this returns nothing", the senior engineer whose PRs everyone imitates, the tribal knowledge
that this module is load-bearing and that one is scratch. None of that transmits to an agent. It
reads the code, not the culture.

So the choice is not whether standards get encoded. They get encoded either way — implicitly, in
whatever the agent infers from the most recent thing it saw, or explicitly, in something it must
read before it writes. The second option is the only one you can review.

## Reviewing output does not scale; reviewing standards does

The instinctive response to agent-written code is more review. That fails for a simple reason: you
are reviewing the output of a process you never specified, one diff at a time, forever. Each review
teaches the agent nothing durable — the next session starts fresh.

Writing the standard down inverts the loop. You review the rule once, argue about it once, and every
future change inherits the outcome. A finding cited as `Rule 02.1` is not one reviewer's preference
that day; it is a decision the team already made, with the reasoning attached. Disagreement moves
from the diff to the rule, which is where it is cheap and where it is settled for everyone.

This is why the rules here are dense, anchored, and citable rather than aspirational. "Write clean
code" is unreviewable. "Every failure starts in exactly one tier: boundary schema, invariant, or
typed result" is a rule you can hold a diff against, and a rule an agent can apply without guessing
what you meant.

## What "best version" actually requires

Three things, and the design of this ruleset follows from them.

**Judgment has to be encoded, not just conclusions.** A rule that says what to do without saying
when it stops applying produces cargo-cult compliance. So the calibrations are written down:
coverage is feedback rather than a target, and the tool-native ordering deliberately inverts the
zero-dependency instinct that safety-critical code depends on. An agent that knows *why* a rule
exists can tell you when your request contradicts it — which is more valuable than obedience.

**Standards must be cheap enough to actually load.** A style guide nobody reads is a document, not a
standard. Rules are loaded per task, two to four files at a time, so following them costs a fraction
of a context window instead of crowding out the problem being solved.

**Compliance has to be measurable.** "The agent should follow the rules" is a hope until you have
measured how often it does. That is what the eval suite exists for, and why its findings are
reported as numbers rather than confidence.

## The honest limit

None of this makes an agent a good engineer. It makes an agent a faithful executor of the standard
you were willing to write down, which means the standard now carries the weight your judgment used
to. That is a real trade, and it favors teams who take the writing seriously.

The rules in this repository are one attempt at that standard, distilled from people who thought
harder about it than most: Ousterhout on complexity, Meyer on contracts, TigerBeetle on control
flow, Beck on tests, DORA on delivery, Kleppmann on data. Take them, argue with them, record your
deviations — the guide exists precisely so that disagreeing with a rule is a first-class act rather
than a quiet violation.

What you should not do is leave the standard implicit and hope the agent infers your best day.
It will infer your average one.
