# 14 Planning

Planning is where scope, contracts, and tests are cheapest to change. A plan is not a schedule; it
is the contract stated before the code exists.

## 14.1 Minimum Viable Plan

Before non-trivial work, name six things — inline is enough, a file is not required:

1. the **boundary** the change lives behind,
2. the **public API** it adds or changes,
3. the **error cases** callers can act on,
4. the **invariants** that stay true after success,
5. the **tests** that would fail without it,
6. the **docs** the change makes stale.

Unable to name one? That is the thing to resolve before writing code, not during. This satisfies
Rule 1.4; the project guide names the template for work that warrants a written plan.

## 14.2 Requirement Before Mechanism

Plan the product requirement, not the proposed mechanism (Rule 10.1): restate it in a sentence or
two before designing. A request naming a solution ("add a cache", "make it a plugin") gets the
requirement extracted first — most shrink once the existing boundary, primitive, or tool capability
is inspected.

## 14.3 Examples Are the Plan's Test List

Derive concrete examples from the requirement: one per business rule plus the boundary cases where
it bends (Rule 4.2). Each becomes a named test at a stated path. An example with no expressible
assertion means the requirement is not yet understood — it becomes a question, not a test.

## 14.4 Slices

Cut work into independently valuable slices, each landing green and revertable (Rules 11.1, 11.2).
A slice names the files it touches, which test goes red first, and the gate it must pass. Order them
so tests precede the behavior they pin, and primitives precede their callers. Past roughly five
slices, it is two plans — say so and split.

## 14.5 Push Back Before Planning Around a Conflict

A request that would weaken a boundary, duplicate a tool, sprawl root config, or turn uncertainty
into abstraction gets Rule 10.6's pushback shape — product goal, conflict, rule or tool contract,
simpler shape — **before** the plan, not as a caveat inside it. Uncertainty is acceptable; hiding it
in a plan is not.

## 14.6 Plans Are Disposable, Contracts Are Not

When implementation contradicts the plan, the plan loses — but the contradiction is information:
re-check the requirement and the contract before adapting (Rule 10.2). Fold what proved durable into
docs, tests, or a decision record and discard the rest; a plan nobody updates is worse than
none (Rule 5.5).
