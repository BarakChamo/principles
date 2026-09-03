/**
 * @description Optional Next.js environment definitions with NEXT_PUBLIC_ enforcement and exact runtime
 * mappings.
 *
 * @module @tenets/env/next
 */

import { defineEnv, parseEnv } from './core';
import type {
	AnyEnvDefinition,
	ClientEnvOutput,
	DefineEnvOptions,
	EnvDefinition,
	EnvSchemaShape,
	EnvSourceValue,
	ParseEnvOptions,
	ServerEnvOutput,
} from './core';

/** @description Prefix required for client-visible Next.js environment variables. */
export const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC_' as const;

type EmptyShape = Readonly<Record<never, never>>;
type EnforceNextClientShape<TClient extends EnvSchemaShape> = Readonly<{
	[TKey in keyof TClient]: TKey extends `${typeof NEXT_PUBLIC_PREFIX}${string}`
		? TClient[TKey]
		: never;
}>;

/** @description Exact runtime mapping required for a Next.js environment definition. */
export type NextRuntimeEnv<TDefinition extends AnyEnvDefinition> = Readonly<{
	[TKey in keyof ServerEnvOutput<TDefinition>]: EnvSourceValue;
}>;

/** @description Defines a Next.js environment without introducing a runtime dependency on Next.js. */
export const defineNextEnv = <
	const TServer extends EnvSchemaShape = EmptyShape,
	const TClient extends EnvSchemaShape = EmptyShape,
	const TShared extends EnvSchemaShape = EmptyShape,
	const TExtends extends readonly AnyEnvDefinition[] = readonly [],
>(
	options: Omit<
		DefineEnvOptions<TServer, EnforceNextClientShape<TClient>, TShared, TExtends>,
		'clientPrefix'
	>,
): EnvDefinition<TServer, EnforceNextClientShape<TClient>, TShared, TExtends> =>
	defineEnv({
		...options,
		clientPrefix: NEXT_PUBLIC_PREFIX,
	});

/** @description Parses the client-safe portion of an exact Next.js runtime mapping. */
export function parseNextEnv<const TDefinition extends AnyEnvDefinition>(
	definition: TDefinition,
	runtimeEnv: NextRuntimeEnv<TDefinition>,
	options: ParseEnvOptions & { readonly target: 'client' },
): ClientEnvOutput<TDefinition>;

/** @description Parses the full server portion of an exact Next.js runtime mapping. */
export function parseNextEnv<const TDefinition extends AnyEnvDefinition>(
	definition: TDefinition,
	runtimeEnv: NextRuntimeEnv<TDefinition>,
	options?: ParseEnvOptions & { readonly target?: 'server' },
): ServerEnvOutput<TDefinition>;
export function parseNextEnv(
	definition: AnyEnvDefinition,
	runtimeEnv: NextRuntimeEnv<AnyEnvDefinition>,
	options: ParseEnvOptions = {},
): Readonly<Record<string, unknown>> {
	return options.target === 'client'
		? parseEnv(definition, runtimeEnv, { ...options, target: 'client' })
		: parseEnv(definition, runtimeEnv, { ...options, target: 'server' });
}
