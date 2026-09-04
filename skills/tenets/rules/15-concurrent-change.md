# 15 Concurrent Change

Several agents or people changing one repository at once is normal. Contention is not a merge
problem to resolve later; it is a design property decided when work is split.

## 15.1 Partition by Write Set

Two tasks run in parallel only when the files they will **write** are disjoint — reads may overlap
freely. Partition by write set, never by task description: "you take Stripe, I take PayPal" is not a
partition until the shared registry, barrel, manifest, and lockfile are accounted for. Name each
task's write set before starting; overlap means the tasks are sequential, or the structure needs
changing (15.7).

## 15.2 Name the Convergence Points

Some files are touched by every change of a kind: registries and barrels, lockfiles, generated
types, migration sequences, changelogs, root config, and the project guide. These are where parallel
work serializes, and they cannot be designed away — only named and made cheap. Each one is:

- **append-only**, so two additions do not overlap,
- **generated**, so nobody edits it by hand,
- or **owned by one change at a time**, and that ownership is stated.

Rule 6.3's timestamped inbox filenames are the canonical instance: the artifact is shaped so
concurrent writers cannot collide. Prefer that shape wherever it is available.

## 15.3 One Writer Per Slice

A slice has one writer until it lands. A second agent takes an adjacent slice or waits; two writers
in one file is not a workflow, it is a rebase.

## 15.4 Re-read Before Landing

A plan goes stale the moment another change lands. Before landing, re-read the files it names and
**re-derive** the change against what is there now rather than replaying what was written against
the old state. A conflict is information about the contract, not just a text collision (Rules 10.2,
14.6).

## 15.5 Declare Integration Order

When concurrent changes depend on each other, the order is declared before work starts, not
discovered at merge time: dependencies before dependents, tests before the behavior they pin — Rule
14.4's ordering applied across changes rather than within one.

## 15.6 No Ceremony

Use what the tools already provide: branches, worktrees, the task graph, and small green commits
(Rule 11.1) — the smaller the batch, the shorter its window to collide. Do not invent lock files,
claim protocols, or ownership registries; that is coordination overhead standing in for a
decomposition fix (Rules 10.3, 10.4).

## 15.7 Structure Follows the Partition

If the natural way to split the work fights the structure, the structure is wrong. Repeated
contention on one file is a decomposition signal (Rule 7.10), not a scheduling problem — the
communication paths a system's structure permits are the ones its design ends up reflecting
(Conway).
