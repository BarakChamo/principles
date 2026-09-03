# @tenets/env

Composable, typed environment contracts on Zod 4.5: server/client/shared partitions, cross-field
deployed-environment rules, an exact-mapping Next.js adapter, and ahead-of-time compiled parsing.

```ts
import { defineEnv, parseEnv, stringValue, urlValue, requiredWhenDeployed } from '@tenets/env';

const provider = defineEnv({ name: 'provider', server: { PROVIDER_TOKEN: stringValue } });

const app = defineEnv({
	name: 'app',
	extends: [provider],
	server: { API_URL: urlValue, VERCEL_ENV: enumValue(['development', 'preview', 'production']) },
	checks: [requiredWhenDeployed('PROVIDER_TOKEN')],
});

export const env = parseEnv(app, process.env); // frozen, typed, only declared keys
```

Next.js apps use `@tenets/env/next` for `NEXT_PUBLIC_` enforcement (compile-time and runtime) and an
exact runtime mapping — every declared key must be listed, because Next inlines `process.env.X`
member access at build time. `@tenets/env/node` is the explicit escape hatch for passing the whole
process environment to config expansion or child processes.

## Credit

Inspired by [t3-oss/t3-env](https://github.com/t3-oss/t3-env) (`@t3-oss/env-nextjs`,
`@t3-oss/env-core`), which established typed env validation with client-prefix safety for the
ecosystem. This package exists for what it adds on top:

- **Composition** — packages declare the variables they own; applications `extends` them into one
  contract, with application definitions deliberately able to refine an inherited key.
- **Deployed-environment rules** — `requiredWhenDeployed`, `forbiddenWhenDeployed`,
  `equalsWhenDeployed`, and the general `envRule`, each reported against the variable at fault and
  each refusing (at parse time) to guard variables the schema does not declare — a rule that would
  pass vacuously is a definition error, not a silent no-op.
- **Performance** — parsing uses Zod 4.5's `z.compile` with a per-definition/per-target cache:
  steady-state parses run ~29× faster than uncached schema construction (see
  `src/typed-env/parse.bench.ts`; `npm run bench`).

## Behavior notes

- Empty strings are treated as undefined by default (`{ emptyStringAsUndefined: false }` opts out).
- Snapshots are frozen and contain only declared keys; server values cannot reach the client target.
- Extension cycles and invalid client prefixes throw `EnvDefinitionError`; invalid values throw
  `EnvValidationError` with the failing variables named in the message.
- `zod ^4.5` is a peer dependency; the package re-exports `z` so consumers stay on one version.
