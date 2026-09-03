/**
 * @description Behavioral tests for composable, snapshot-based environment validation.
 *
 * @module @tenets/env
 */

import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
	EnvDefinitionError,
	EnvValidationError,
	booleanFlagValue,
	defineEnv,
	parseEnv,
	stringValue,
} from './index';

describe('environment parsing', () => {
	it('validates an injected source and returns only declared values', () => {
		expect.hasAssertions();
		const definition = defineEnv({
			name: 'runner',
			server: {
				API_URL: z.url(),
			},
		});

		const env = parseEnv(definition, {
			API_URL: 'https://example.com',
			UNDECLARED: 'hidden',
		});

		expect(env).toStrictEqual({ API_URL: 'https://example.com' });
		expect('UNDECLARED' in env).toBe(false);
	});

	it('returns transformed schema outputs rather than raw strings', () => {
		expect.hasAssertions();
		const definition = defineEnv({
			name: 'runner',
			server: {
				PORT: z.string().transform(Number).pipe(z.number()),
			},
		});

		const env = parseEnv(definition, { PORT: '4321' });

		expect(env.PORT).toBe(4321);
	});

	it('parses strict boolean flags and rejects ambiguous values', () => {
		expect.hasAssertions();
		const definition = defineEnv({
			name: 'runner',
			server: {
				DEBUG: booleanFlagValue,
			},
		});

		expect(parseEnv(definition, { DEBUG: '1' })).toStrictEqual({ DEBUG: true });
		expect(() => parseEnv(definition, { DEBUG: 'yes' })).toThrow(EnvValidationError);
	});

	it('returns an immutable snapshot independent of later source changes', () => {
		expect.hasAssertions();
		const source: Record<string, string | undefined> = { TOKEN: 'initial' };
		const definition = defineEnv({
			name: 'runner',
			server: { TOKEN: stringValue },
		});
		const env = parseEnv(definition, source);

		source['TOKEN'] = 'changed';

		expect(env.TOKEN).toBe('initial');
		expect(Object.isFrozen(env)).toBe(true);
	});

	it('treats empty strings as undefined before validation by default', () => {
		expect.hasAssertions();
		const definition = defineEnv({
			name: 'runner',
			server: { OPTIONAL_TOKEN: z.string().optional() },
		});

		const env = parseEnv(definition, { OPTIONAL_TOKEN: '' });

		expect(env.OPTIONAL_TOKEN).toBeUndefined();
	});

	it('keeps empty strings only when explicitly requested', () => {
		expect.hasAssertions();
		const definition = defineEnv({
			name: 'runner',
			server: { OPTIONAL_TOKEN: z.string().optional() },
		});

		const env = parseEnv(definition, { OPTIONAL_TOKEN: '' }, { emptyStringAsUndefined: false });

		expect(env.OPTIONAL_TOKEN).toBe('');
	});

	it('composes package definitions before validating the application', () => {
		expect.hasAssertions();
		const providerDefinition = defineEnv({
			name: 'provider',
			server: { PROVIDER_TOKEN: stringValue },
		});
		const applicationDefinition = defineEnv({
			name: 'application',
			extends: [providerDefinition],
			server: { APP_MODE: stringValue },
		});

		const env = parseEnv(applicationDefinition, {
			APP_MODE: 'test',
			PROVIDER_TOKEN: 'secret',
		});

		expect(env).toStrictEqual({
			APP_MODE: 'test',
			PROVIDER_TOKEN: 'secret',
		});
	});

	it('preserves extended shared and client partitions for client parsing', () => {
		expect.hasAssertions();
		const packageDefinition = defineEnv({
			name: 'browser-package',
			client: { PUBLIC_PACKAGE_URL: stringValue },
			clientPrefix: 'PUBLIC_',
			server: { PACKAGE_SECRET: stringValue },
			shared: { RUNTIME: stringValue },
		});
		const applicationDefinition = defineEnv({
			name: 'browser-app',
			client: { PUBLIC_APP_URL: stringValue },
			clientPrefix: 'PUBLIC_',
			extends: [packageDefinition],
		});

		const env = parseEnv(
			applicationDefinition,
			{
				PACKAGE_SECRET: 'hidden',
				PUBLIC_APP_URL: 'https://app.example.com',
				PUBLIC_PACKAGE_URL: 'https://package.example.com',
				RUNTIME: 'browser',
			},
			{ target: 'client' },
		);

		expect(env).toStrictEqual({
			PUBLIC_APP_URL: 'https://app.example.com',
			PUBLIC_PACKAGE_URL: 'https://package.example.com',
			RUNTIME: 'browser',
		});
		expect('PACKAGE_SECRET' in env).toBe(false);
	});

	it('throws structured validation errors without writing to the console', () => {
		expect.hasAssertions();
		const log = vi.spyOn(console, 'log').mockReturnValue(undefined);
		const errorOutput = vi.spyOn(console, 'error').mockReturnValue(undefined);
		const definition = defineEnv({
			name: 'runner',
			server: { REQUIRED_TOKEN: stringValue },
		});

		let caught: unknown;
		try {
			parseEnv(definition, {});
		} catch (error) {
			caught = error;
		}

		expect(caught).toBeInstanceOf(EnvValidationError);
		expect(caught).toMatchObject({
			definitionName: 'runner',
		});
		expect(log).not.toHaveBeenCalled();
		expect(errorOutput).not.toHaveBeenCalled();
	});
});

describe('environment definitions', () => {
	it('rejects client variables that violate the configured prefix', () => {
		expect.hasAssertions();

		expect(() =>
			defineEnv({
				name: 'browser-app',
				client: { WRONG_NAME: stringValue },
				clientPrefix: 'PUBLIC_',
			}),
		).toThrow(EnvDefinitionError);
	});

	it('rejects cyclic extension graphs during parsing', () => {
		expect.hasAssertions();
		const first = defineEnv({ name: 'first', server: { FIRST: stringValue } });
		const second = defineEnv({
			name: 'second',
			extends: [first],
			server: { SECOND: stringValue },
		});
		Object.assign(first, { extends: [second] });

		expect(() => parseEnv(first, { FIRST: 'one', SECOND: 'two' })).toThrow(/cycle/i);
	});
});
