# Dimension 5 — Data and runtime (Rules 12, 13)

- Is every datum classified as source of truth or derived, with exactly one system of record per
  entity? (12.1)
- Can each derived store be wiped and rebuilt by a documented backfill path? A store that cannot is
  holding truth. (12.1)
- Does the store choice match the access pattern and guarantee — relational for truth with
  invariants, KV for ephemeral derived state, analytics off the request path, blobs by reference?
  (12.2)
- Is the same fact ever written to two stores in one request? (12.3)
- Is the transactional boundary the data that must be consistent together, in one system of record,
  with explicit compensation across boundaries? (12.4)
- Do schema changes follow expand–contract, stay compatible with the previous release, and ship
  destructive steps separately and only after verification? (12.5)
- Are backfills resumable, idempotent, and bounded? (12.5, 3.3)
- Does one workspace own each table, with others going through its API rather than its storage? (12.6)
- Is module-scope state treated as a cache that may vanish, never as truth? (13.1)
- Are independent awaits run concurrently rather than sequentially, with work started early and
  awaited late? (13.2)
- Does every response declare its cacheability, and every cache entry have an owner, a key
  discipline, and an invalidation story? (13.3)
- Is the request path carrying only what the response needs, with notifications, analytics, and
  reconciliation deferred? (13.4)
- Is every mutation endpoint and queue consumer idempotent, by key or by nature? (13.5)
- Is long or fan-out work chunked, resumable, and bounded against downstream limits? (13.6)
