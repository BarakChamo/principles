# 13 Serverless Runtime

Functions are stateless, bounded, retried, and billed by wall clock — design for those four facts.
The project guide names the platform and its limits.

## 13.1 Instances Are Caches

Nothing in a function instance is truth (Rule 12.1): module-scope state is an optimization that must
survive being lost at any moment. Use module scope deliberately — hoist static I/O and client
construction for warm reuse, lazy-load heavy dependencies, keep init cheap. Cold start is a function
of bundle size and init work.

## 13.2 No Waterfalls

Sequential awaits of independent work are the primary performance bug — idle time costs latency and
compute both. Start independent work early, await late, run independents concurrently, and stream
what can render before the slowest dependency resolves.

## 13.3 Cache Discipline

Every response declares its cacheability; every cache entry has an owner, a key discipline, and an
invalidation story. Know the layers — edge/CDN, framework data cache, per-request memoization,
application KV — and prefer tag-based invalidation; TTL is the backstop, not the strategy. A cache
without an invalidation story is a stale-data bug scheduled for later.

## 13.4 Off the Request Path

The request path carries only what the response needs; defer the rest — notifications, analytics
writes, reconciliation — to after-response hooks or queues. Respond fast, reconcile asynchronously.

## 13.5 Ambient Retries, Mandatory Idempotency

Platforms retry and queues deliver at least once, so every mutation endpoint and consumer is
idempotent — by idempotency key or by nature. A non-idempotent handler in a retrying environment is
a duplicate-effect bug waiting for load.

## 13.6 Bounds and Fan-Out

Time, memory, and payload limits are hard walls: design chunked, resumable work (Rule 03.3); move
long jobs to durable workflows. Bound fan-out to protect downstreams — unbounded concurrent
functions against a fixed-connection database is the classic incident; use pooled or HTTP drivers
and explicit concurrency caps.

Observability follows Rule 11.4, plus a per-invocation correlation id in logs — stateless instances
mean logs are the only memory.
