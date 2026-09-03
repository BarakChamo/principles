# 11 Change Delivery

How change ships matters as much as how it is written: smaller changes are easier to reason about,
review, and recover from.

## 11.1 Small Batches

Work in small, independently valuable slices — one logical change per commit. A commit mixing a
refactor with a behavior change, or two unrelated fixes, is two commits; split large work so each
slice lands green and reviewable instead of accumulating into one unreviewable batch.

## 11.2 Green and Revertable

Every commit passes the acceptance gate and reverts cleanly on its own; never commit red. Unfinished
behavior stays unreachable — behind a flag, unwired from routes and exports — rather than
half-shipped, and the isolation is deleted with the same discipline when the work completes (Rule
1.5). Commit messages are imperative and carry the why, not a file list.

## 11.3 Signals, Not Targets

Any metric used to steer work — coverage, counts, scores, sizes — is a signal, never a target;
optimizing the number instead of the property it measures games the signal and hides the problem.
Rule 4.3's coverage stance is the canonical instance.

## 11.4 Observability

A behavior change that matters in production ships with the signal to see it fail: a log with
context enough to act, a health state, or a metric — the project guide names the tooling. Expected
failures log where the boundary translates them, never silently absorbed; invariant failures surface
loudly. Caller-facing errors stay useful without leaking secrets, internal locations, or raw
upstream payloads.
