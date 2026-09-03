/**
 * @description Behavioral tests for environment composition: inheritance depth, override precedence,
 * diamond graphs, inherited cross-field rules, and repeated-parse behavior.
 *
 * @module @tenets/env
 */
import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import {
	defineEnv,
	enumValue,
	integerValue,
	optionalSecretValue,
	parseEnv,
	requiredWhenDeployed,
	stringValue,
} from './index';

const base = defineEnv({
	name: 'base',
	server: { BASE_TOKEN: stringValue },
	shared: { RUNTIME: enumValue(['node', 'edge']) },
});

describe('multi-level inheritance', () => {
	it('merges partitions across a three-level chain', () => {
		const mid = defineEnv({
			name: 'mid',
			extends: [base],
			server: { MID_URL: stringValue },
		});
		const app = defineEnv({
			name: 'app',
			extends: [mid],
			server: { APP_MODE: stringValue },
		});

		const env = parseEnv(app, {
			APP_MODE: 'test',
			BASE_TOKEN: 'secret',
			MID_URL: 'https://mid.example.com',
			RUNTIME: 'node',
		});

		expect(env).toStrictEqual({
			APP_MODE: 'test',
			BASE_TOKEN: 'secret',
			MID_URL: 'https://mid.example.com',
			RUNTIME: 'node',
		});
	});

	it('lets the application deliberately refine an extension key (application wins)', () => {
		const app = defineEnv({
			name: 'app',
			extends: [base],
			// Refines BASE_TOKEN from any string to a bounded integer string.
			server: { BASE_TOKEN: integerValue({ min: 1, max: 9 }) },
		});

		expect(parseEnv(app, { BASE_TOKEN: '5', RUNTIME: 'node' }).BASE_TOKEN).toBe(5);
		expect(() => parseEnv(app, { BASE_TOKEN: 'not-a-number', RUNTIME: 'node' })).toThrow();
	});

	it('parses a diamond graph once per key without conflict', () => {
		const left = defineEnv({ name: 'left', extends: [base], server: { LEFT: stringValue } });
		const right = defineEnv({ name: 'right', extends: [base], server: { RIGHT: stringValue } });
		const app = defineEnv({ name: 'app', extends: [left, right] });

		const env = parseEnv(app, {
			BASE_TOKEN: 'secret',
			LEFT: 'l',
			RIGHT: 'r',
			RUNTIME: 'edge',
		});

		expect(env.LEFT).toBe('l');
		expect(env.RIGHT).toBe('r');
		expect(env.BASE_TOKEN).toBe('secret');
	});
});

describe('inherited cross-field rules', () => {
	const guarded = defineEnv({
		name: 'guarded-package',
		server: {
			VERCEL_ENV: enumValue(['development', 'preview', 'production']),
			PKG_SECRET: optionalSecretValue(8),
		},
		checks: [requiredWhenDeployed('PKG_SECRET')],
	});
	const app = defineEnv({ name: 'app', extends: [guarded], server: { APP_MODE: stringValue } });

	it('enforces an extension-declared deployed rule when the application parses', () => {
		expect(() => parseEnv(app, { APP_MODE: 'x', VERCEL_ENV: 'production' })).toThrow(
			'PKG_SECRET is required in deployed environments',
		);
	});

	it('passes locally where the inherited rule permits absence', () => {
		const env = parseEnv(app, { APP_MODE: 'x', VERCEL_ENV: 'development' });
		expect(env.PKG_SECRET).toBeUndefined();
	});
});

describe('client target through inheritance', () => {
	it('strips server keys from every level of the chain', () => {
		const pkg = defineEnv({
			name: 'pkg',
			client: { PUBLIC_PKG: stringValue },
			clientPrefix: 'PUBLIC_',
			server: { PKG_SECRET: stringValue },
		});
		const app = defineEnv({
			name: 'app',
			extends: [pkg],
			client: { PUBLIC_APP: stringValue },
			clientPrefix: 'PUBLIC_',
			server: { APP_SECRET: stringValue },
		});

		const env = parseEnv(
			app,
			{
				APP_SECRET: 'a',
				PKG_SECRET: 'p',
				PUBLIC_APP: 'pa',
				PUBLIC_PKG: 'pp',
			},
			{ target: 'client' },
		);

		expect(env).toStrictEqual({ PUBLIC_APP: 'pa', PUBLIC_PKG: 'pp' });
		expect('APP_SECRET' in env).toBe(false);
		expect('PKG_SECRET' in env).toBe(false);
	});
});

describe('repeated parsing', () => {
	it('returns independent frozen snapshots on every parse of the same definition', () => {
		const definition = defineEnv({ name: 'repeat', server: { TOKEN: stringValue } });

		const first = parseEnv(definition, { TOKEN: 'one' });
		const second = parseEnv(definition, { TOKEN: 'two' });

		expect(first.TOKEN).toBe('one');
		expect(second.TOKEN).toBe('two');
		expect(Object.isFrozen(first)).toBe(true);
		expect(Object.isFrozen(second)).toBe(true);
	});

	it('keeps server and client compiled targets independent for one definition', () => {
		const definition = defineEnv({
			name: 'dual',
			client: { PUBLIC_URL: z.url() },
			clientPrefix: 'PUBLIC_',
			server: { SECRET: stringValue },
		});
		const source = { PUBLIC_URL: 'https://a.example.com', SECRET: 's' };

		expect(parseEnv(definition, source).SECRET).toBe('s');
		expect('SECRET' in parseEnv(definition, source, { target: 'client' })).toBe(false);
		// And again, from cache, in both directions.
		expect(parseEnv(definition, source, { target: 'client' }).PUBLIC_URL).toBe(
			'https://a.example.com',
		);
		expect(parseEnv(definition, source).SECRET).toBe('s');
	});
});
