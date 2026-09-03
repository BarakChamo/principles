# 12 Data and State

Every datum is classified as source of truth or derived; that classification is the data model. The
project guide names the concrete stores.

## 12.1 System of Record

Each entity has exactly one system of record. Caches, search indexes, and analytics tables are
derived data — materialized views rebuildable from the system of record by a documented backfill
path. A store that cannot be wiped and rebuilt without data loss is holding truth and must be
treated as such.

## 12.2 Store Selection

Choose stores by access pattern and guarantee, defaulting boring:

- **Relational (OLTP):** the default home for truth — entities with invariants, transactions,
  relations. Use it until it measurably hurts.
- **KV/cache:** ephemeral, latency-critical, derived state only — sessions, rate limits, hot caches.
  Test: wiping it may lose warmth, never data.
- **Analytics (OLAP):** append-only events and aggregates, fed by stream or CDC, eventually
  consistent, never queried in the request path.
- **Blob storage:** large immutable objects; the database holds references.

## 12.3 Sync Without Dual-Writes

Never write the same fact to two stores in one request. Derive secondary stores from the system of
record via an outbox, CDC, or event stream with idempotent consumers (Rule 13.5); every derived
store keeps a documented rebuild path.

## 12.4 Transaction Boundaries

The transactional boundary is the data that must be consistent together — keep it in one system of
record and one transaction. Across boundaries, eventual consistency with explicit compensation;
never a distributed transaction by accident.

## 12.5 Migrations

Schema changes use expand–contract: add the new shape, migrate readers/writers, backfill, verify,
then contract. Deploys overlap versions, so every migration is compatible with the previous release
(n−1). Backfills are resumable, idempotent, bounded jobs (Rule 03.3); destructive steps ship
separately from the changes that depend on them, and only after verification.

## 12.6 Ownership

One workspace owns each table or collection; others go through its API, never the storage (Rule 07.4
extended to persistence). Schema changes belong to the owner and follow Rule 07.5's canonical-state
discipline.
