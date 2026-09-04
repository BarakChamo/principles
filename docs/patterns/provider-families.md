# Provider families: fan out to build, fan in to consume

A recurring shape: one capability, many interchangeable implementations. Payments with Stripe,
PayPal and Alipay. Storage with S3, GCS and a local disk. Auth with three identity providers.

Two things are wanted at once, and they pull in opposite directions. **Building** them wants
isolation, so several people or agents can work without clashing and so a change to one cannot break
another. **Consuming** them wants one import and one interface, so the application can switch
provider by configuration without learning the topology.

The usual answer — a facade package that imports every provider into a registry and re-exports the
lot through one barrel — resolves this badly. It reintroduces exactly the contention it was meant to
remove: every new provider edits the shared registry *and* the shared barrel, so two agents adding
two providers collide on the same two files. It also pulls every provider's SDK into every
consumer's bundle, and constructs every provider at import time.

## The recommendation

**Fan out by workspace. Fan in by composition, at the consumer.**

```
packages/
  payments/              # the port: types, the selection helper, contract tests
  payments-stripe/       # one workspace per provider
  payments-paypal/
apps/
  web/                   # depends on the port and the providers it deploys
```

Dependencies point one way: each provider depends on the port for its interface. **No provider
imports another, and nothing imports "all providers."** The application is the composition root:

```ts
// apps/web/src/payments.ts
import { createPayments } from '@workspace/payments';
import { createStripe } from '@workspace/payments-stripe';
import { createPaypal } from '@workspace/payments-paypal';
import { env } from './env';

export const payments = createPayments({
	providers: {
		stripe: createStripe({ apiKey: env.STRIPE_KEY }),
		paypal: createPaypal({ clientId: env.PAYPAL_CLIENT_ID }),
	},
	default: env.PAYMENT_PROVIDER,
});
```

The port owns the interface, the selection, and the failure contract:

```ts
// packages/payments/src/index.ts
export interface PaymentProvider {
	readonly name: string;
	charge(input: ChargeInput): ResultAsync<Charge, ChargeError>;
	refund(input: RefundInput): ResultAsync<Refund, RefundError>;
}
```

`env.PAYMENT_PROVIDER` is parsed at the environment boundary against the keys the app actually
wired, so an unknown provider name fails at startup as a boundary error — not as a runtime
`throw new Error('Unknown provider')` on the first charge (Rules 2.1, 2.4).

## Why this shape

- **Adding a provider touches no shared implementation file.** One new workspace, plus one line in
  the app's composition root. Contrast the registry version, where every addition edits two files
  every other provider also edits (Rule 15.2).
- **The boundary is machine-enforced, not conventional.** Because slices are workspaces, `exports`
  makes their internals unreachable — an unlisted deep path fails to resolve — and the workspace
  graph can deny provider-to-provider dependencies outright. Inside a single package, none of that
  applies; you are relying on everyone remembering (Rule 7.10).
- **Only deployed providers are bundled.** Cold start and bundle size track what the app actually
  uses, instead of every SDK the family has ever supported (Rule 13.1).
- **Nothing is constructed at import time.** Providers are built where their configuration lives, so
  no module-scope `new` runs side effects during import (Rule 3.8).
- **The deletion test passes.** Removing a provider deletes one workspace and one dependency line
  (Rule 7.10).
- **One contract, proven once.** The port ships the contract tests and every provider runs them, so
  interchangeability is verified rather than asserted (Rule 4.4).
- **Parallel work is genuinely parallel.** Two agents on two providers share no write set at all
  (Rule 15.1), and per-workspace test and build tasks mean each one's validation is scoped to what
  it changed.

## Dynamic selection still works

Per-request or per-tenant switching needs no registry either — the app passes the map it built and
the port selects by key:

```ts
const provider = payments.for(tenant.paymentProvider); // typed by the keys the app wired
```

If a provider must be loaded lazily to keep a serverless bundle small, the app does that with a
dynamic import at its own boundary, where the async cost is visible. Do not hide it inside the port
by quietly turning a synchronous resolver into an asynchronous one — that is a public contract
change (Rule 7.3).

## When one package is the right answer instead

Directories inside one package (`src/providers/<name>/`, an `#internal/*` alias for shared types) is
the cheaper shape, and it is correct when the providers are few, always released together, and owned
by the same person. You give up machine-enforced isolation and per-provider task scoping.

The dividing line: **a slice earns workspace status when someone needs to own, release, or test it
independently — which is the same moment parallel agents start working on it.** Below that
threshold, the extra manifests are ceremony (Rules 7.5, 10.3).

## If you keep a hand-maintained registry anyway

Sometimes it genuinely is simplest: ten providers, one owner, no parallel work. That is fine, and
Rule 7.10 asks only that you record it as a deviation in the project guide with its cost stated —
every addition edits one shared file, and that file is a convergence point (Rule 15.2). What the
rules refuse is the version that pretends to have no cost.
