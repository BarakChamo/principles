/**
 * @description Public typed-environment API and common Zod validators.
 *
 * @module @tenets/env
 */

import { z } from 'zod';

import { EnvDefinitionError } from './core.js';
import type { EnvCheck, EnvObjectSchema, EnvSchema } from './core.js';

export { EnvValidationError, defineEnv, parseEnv } from './core.js';
export { EnvDefinitionError };
export type { EnvCheck, EnvObjectSchema } from './core.js';

/**
 * @description Zod re-exported for composing environment contracts.
 *
 * @remarks
 *   A package adding a constraint the helpers below do not cover needs the raw builders.
 *   Re-exporting `z` keeps a consumer from importing Zod directly and drifting to a different
 *   version than the one this boundary parses with.
 */
export { z };
export type {
	AnyEnvDefinition,
	ClientEnvOutput,
	DefineEnvOptions,
	EnvDefinition,
	EnvIssue,
	EnvSchema,
	EnvSchemaShape,
	EnvSource,
	EnvSourceValue,
	ParseEnvOptions,
	ServerEnvOutput,
} from './core.js';

/** @description Required string environment value. */
export const stringValue = z.string();

/** @description Required URL environment value. */
export const urlValue = z.url();

/** @description Optional string environment value. */
export const optionalStringValue = z.string().optional();

/** @description Required `0`/`1` environment flag transformed to a boolean. */
export const booleanFlagValue = z.enum(['0', '1']).transform((value) => value === '1');

/** @description Optional `0`/`1` environment flag transformed to a boolean when present. */
export const optionalBooleanFlagValue = booleanFlagValue.optional();

/**
 * @description Environment flag spelled `true`/`false`.
 *
 * @remarks
 *   Distinct from {@link booleanFlagValue}, which reads `0`/`1`. This project writes `true`/`false`
 *   in every compose file, Vercel project and `.env`, and a flag compared as a string is how a
 *   preview-only capability reaches production: `"false"` is truthy.
 */
export const trueFalseFlagValue = z.enum(['true', 'false']).transform((value) => value === 'true');

/** @description Optional `true`/`false` flag, absent when unset. */
export const optionalTrueFalseFlagValue = trueFalseFlagValue.optional();

/**
 * @description `true`/`false` flag that falls back to a declared default.
 *
 * @remarks
 *   Uses `prefault`, not `default`: the fallback is raw input parsed through the schema, so an
 *   invalid fallback fails loudly instead of bypassing validation.
 * @param fallback - Value used when the variable is absent from the source.
 */
export const trueFalseFlagWithDefault = (fallback: boolean) =>
	trueFalseFlagValue.prefault(fallback ? 'true' : 'false');

/**
 * @description Integer environment value constrained to an inclusive range.
 *
 * @remarks
 *   Environment values arrive as strings, so this transforms before it validates. The digits regex
 *   runs first because `Number` is looser than an environment integer should be: `Number(" ")` is
 *   `0`, and hex or exponent spellings would pass silently. Declaring the bound here rather than
 *   checking it at the use site is the point: a concurrency limit or a port is wrong at the
 *   boundary or never.
 * @param range - Inclusive minimum and maximum the value must fall within.
 */
export const integerValue = (range: { readonly min: number; readonly max: number }) =>
	z
		.string()
		.regex(/^-?\d+$/, 'must be a base-10 integer')
		.transform(Number)
		.pipe(z.int().min(range.min).max(range.max));

/**
 * @description Integer within a range that falls back to a declared default.
 *
 * @param range - Inclusive bounds, plus the value used when the variable is absent.
 */
export const integerValueWithDefault = (range: {
	readonly min: number;
	readonly max: number;
	readonly fallback: number;
}) => integerValue(range).prefault(String(range.fallback));

/**
 * @description Environment value restricted to a fixed set of spellings.
 *
 * @param allowed - The permitted values; anything else fails at the boundary.
 */
export const enumValue = <const TAllowed extends readonly [string, ...string[]]>(
	allowed: TAllowed,
) => z.enum(allowed);

/**
 * @description Any declared value with a fallback used when it is absent.
 *
 * @remarks
 *   Uses `prefault`, not `default`: the fallback is raw input parsed through the schema, so an
 *   invalid fallback fails loudly instead of bypassing validation.
 * @param schema - The validator applied when the variable is present.
 * @param fallback - Raw string used when the source does not carry the variable.
 */
export const withDefault = <const TSchema extends EnvSchema>(
	schema: TSchema,
	fallback: NoInfer<z.input<TSchema>> & string,
) => z.prefault(schema, fallback);

/** @description Required UUID environment value. */
export const uuidValue = z.uuid();

/** @description Optional UUID environment value. */
export const optionalUuidValue = uuidValue.optional();

/** @description Optional URL environment value. */
export const optionalUrlValue = urlValue.optional();

/**
 * @description Secret with a minimum length, for tokens and encryption keys.
 *
 * @remarks
 *   A length floor is the one property a secret can be checked for at a boundary, and it is worth
 *   checking: it catches a variable left at a placeholder or truncated in a paste, which otherwise
 *   surfaces as an authentication failure a long way from its cause.
 * @param minimumLength - Fewest characters the secret may contain.
 */
export const secretValue = (minimumLength: number) => z.string().min(minimumLength);

/**
 * @description Optional secret, length-checked when present.
 *
 * @param minimumLength - Fewest characters the secret may contain.
 */
export const optionalSecretValue = (minimumLength: number) => secretValue(minimumLength).optional();

/** @description Non-empty string, rejecting a variable that is set but blank. */
export const nonEmptyStringValue = z.string().min(1);

/**
 * @description Unsigned decimal held as a string.
 *
 * @remarks
 *   Kept as text where the consumer parses it with its own precision: a rate or monetary factor
 *   read through `Number` at the boundary loses the exactness the caller asked for.
 */
export const decimalStringValue = z
	.string()
	.regex(/^[+-]?\d+(\.\d+)?$/, 'must be a decimal string');

/**
 * @description URL restricted to a scheme.
 *
 * @remarks
 *   `z.url()` accepts any scheme, so a variable meant to be an HTTPS endpoint will hold `http://`
 *   quite happily — which for a media source or a provider callback is the difference between a
 *   private fetch and one a network can rewrite.
 * @param scheme - Required scheme prefix, for example `https://`.
 */
export const urlValueWithScheme = (scheme: string) =>
	z.url().refine((value) => value.startsWith(scheme), `must start with "${scheme}"`);

/**
 * @description Optional URL restricted to a scheme.
 *
 * @param scheme - Required scheme prefix, for example `https://`.
 */
export const optionalUrlValueWithScheme = (scheme: string) => urlValueWithScheme(scheme).optional();

/** @description Preview and Production; the environments where a permissive default costs money. */
const isDeployed = (value: Record<string, unknown>) => {
	const environment = value['VERCEL_ENV'];
	return environment === 'preview' || environment === 'production';
};

/**
 * @description Refuses a deployed-environment rule over variables the schema does not declare. `z.object()`
 * strips undeclared keys before checks run, so a rule reading an undeclared `VERCEL_ENV` would pass
 * vacuously in every environment — a guard that silently never fires is worse than no guard.
 *
 * @throws { EnvDefinitionError } When a rule references an undeclared variable, or when the
 *   schema's declared shape cannot be inspected at all.
 */
const requireDeclared = (schema: EnvObjectSchema, keys: readonly string[], rule: string): void => {
	const shape = 'shape' in schema ? schema.shape : undefined;
	if (typeof shape !== 'object' || shape === null) {
		throw new EnvDefinitionError(
			`${rule} cannot verify its variables: the wrapped schema exposes no declared shape.`,
		);
	}
	for (const key of keys) {
		if (!(key in shape)) {
			throw new EnvDefinitionError(
				`${rule} references "${key}", which is not declared in the environment definition. ` +
					`Declare it in a server/client/shared partition so the rule can observe it.`,
			);
		}
	}
};

/** @description Attaches one cross-field rule to the object schema, reported against `key`. */
const attachRule = (
	schema: EnvObjectSchema,
	key: string,
	message: string,
	isValid: (env: Record<string, unknown>) => boolean,
): EnvObjectSchema =>
	schema.check((payload) => {
		if (!isValid(payload.value)) {
			payload.issues.push({
				code: 'custom',
				continue: true,
				input: payload.value,
				message,
				path: [key],
			});
		}
	});

/**
 * @description Requires a variable once the environment is deployed.
 *
 * @remarks
 *   The rule most of this project's contracts need, and the reason `defineEnv` accepts checks at
 *   all: a secret may be absent locally and must be present in Preview and Production. The issue is
 *   reported against the missing variable rather than the object, so the failure names what to
 *   set.
 * @param key - Variable required once `VERCEL_ENV` is preview or production.
 */
export const requiredWhenDeployed =
	(key: string): EnvCheck =>
	(schema) => {
		requireDeclared(schema, ['VERCEL_ENV', key], `requiredWhenDeployed("${key}")`);
		return attachRule(
			schema,
			key,
			`${key} is required in deployed environments`,
			(value) => !isDeployed(value) || Boolean(value[key]),
		);
	};

/**
 * @description Forbids a variable or flag once the environment is deployed.
 *
 * @param key - Variable that must be absent or false in Preview and Production.
 * @param message - Why the setting is local-only.
 */
export const forbiddenWhenDeployed =
	(key: string, message: string): EnvCheck =>
	(schema) => {
		requireDeclared(schema, ['VERCEL_ENV', key], `forbiddenWhenDeployed("${key}")`);
		return attachRule(schema, key, message, (value) => !isDeployed(value) || !value[key]);
	};

/**
 * @description Requires a variable to equal a value once deployed.
 *
 * @param key - Variable constrained in Preview and Production.
 * @param expected - The only value the variable may hold there.
 * @param message - Why the deployed environment demands it.
 */
export const equalsWhenDeployed =
	(key: string, expected: unknown, message: string): EnvCheck =>
	(schema) => {
		requireDeclared(schema, ['VERCEL_ENV', key], `equalsWhenDeployed("${key}")`);
		return attachRule(
			schema,
			key,
			message,
			(value) => !isDeployed(value) || value[key] === expected,
		);
	};

/** @description The parsed environment a cross-field rule inspects. */
export type EnvValues = Readonly<Record<string, unknown>>;

/** @description True in Preview and Production, where a permissive default costs money. */
export const deployed = (env: EnvValues) =>
	env['VERCEL_ENV'] === 'preview' || env['VERCEL_ENV'] === 'production';

/** @description True in Production only. */
export const production = (env: EnvValues) => env['VERCEL_ENV'] === 'production';

/** @description True in Preview only. */
export const preview = (env: EnvValues) => env['VERCEL_ENV'] === 'preview';

/**
 * @description A cross-field rule reported against one variable.
 *
 * @remarks
 *   The general form the shortcuts above are special cases of. The issue lands on `key` rather than
 *   on the object: an operator reading a failed boot needs the name of the variable to set, not the
 *   news that the environment is invalid. The predicate returns true when the environment is
 *   _acceptable_, which keeps each rule readable as the condition it protects.
 * @param key - Variable the issue is attributed to.
 * @param message - What is wrong, phrased for whoever has to fix it.
 * @param isValid - Returns true when this rule is satisfied.
 */
export const envRule =
	(key: string, message: string, isValid: (env: EnvValues) => boolean): EnvCheck =>
	(schema) => {
		requireDeclared(schema, [key], `envRule("${key}")`);
		return attachRule(schema, key, message, isValid);
	};

/**
 * @description String that must parse as JSON.
 *
 * @remarks
 *   For keys held as serialized JSON — a JWK, a JWKS — where the consumer parses them later.
 *   Checked at the boundary rather than at first use, because a malformed key otherwise surfaces as
 *   a failure at its first use — a long way from the variable that caused it — rather than a
 *   refusal to start.
 */
export const jsonStringValue = z.string().refine((value) => {
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
}, 'must contain valid JSON');

/** @description Optional JSON string, checked when present. */
export const optionalJsonStringValue = jsonStringValue.optional();
