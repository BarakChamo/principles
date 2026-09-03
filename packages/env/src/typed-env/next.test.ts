/**
 * @description Behavioral tests for the optional Next.js environment wrapper.
 *
 * @module @tenets/env/next
 */

import { describe, expect, it } from 'vitest';

import { EnvDefinitionError, defineEnv, stringValue } from './index';
import { NEXT_PUBLIC_PREFIX, defineNextEnv, parseNextEnv } from './next';

describe('next.js environment support', () => {
	it('validates server, client, and shared values on the server', () => {
		expect.hasAssertions();
		const definition = defineNextEnv({
			name: 'web',
			client: { NEXT_PUBLIC_APP_URL: stringValue },
			server: { DATABASE_URL: stringValue },
			shared: { NODE_ENV: stringValue },
		});

		const env = parseNextEnv(
			definition,
			{
				DATABASE_URL: 'postgres://localhost/app',
				NEXT_PUBLIC_APP_URL: 'https://example.com',
				NODE_ENV: 'test',
			},
			{ target: 'server' },
		);

		expect(env).toStrictEqual({
			DATABASE_URL: 'postgres://localhost/app',
			NEXT_PUBLIC_APP_URL: 'https://example.com',
			NODE_ENV: 'test',
		});
	});

	it('omits server-only values from client output', () => {
		expect.hasAssertions();
		const definition = defineNextEnv({
			name: 'web',
			client: { NEXT_PUBLIC_APP_URL: stringValue },
			server: { DATABASE_URL: stringValue },
		});

		const env = parseNextEnv(
			definition,
			{
				DATABASE_URL: 'postgres://localhost/app',
				NEXT_PUBLIC_APP_URL: 'https://example.com',
			},
			{ target: 'client' },
		);

		expect(env).toStrictEqual({ NEXT_PUBLIC_APP_URL: 'https://example.com' });
	});

	it('rejects a client variable without the NEXT_PUBLIC_ prefix at runtime', () => {
		expect.hasAssertions();
		expect(() =>
			defineEnv({
				name: 'web',
				client: { APP_URL: stringValue },
				clientPrefix: NEXT_PUBLIC_PREFIX,
			}),
		).toThrow(EnvDefinitionError);
	});

	it('composes an extended package definition through the Next adapter', () => {
		expect.hasAssertions();
		const pkg = defineEnv({ name: 'pkg', server: { PKG_TOKEN: stringValue } });
		const definition = defineNextEnv({
			name: 'web',
			extends: [pkg],
			client: { NEXT_PUBLIC_APP_URL: stringValue },
		});

		const server = parseNextEnv(definition, {
			NEXT_PUBLIC_APP_URL: 'https://example.com',
			PKG_TOKEN: 'secret',
		});
		expect(server.PKG_TOKEN).toBe('secret');

		const client = parseNextEnv(
			definition,
			{ NEXT_PUBLIC_APP_URL: 'https://example.com', PKG_TOKEN: 'secret' },
			{ target: 'client' },
		);
		expect('PKG_TOKEN' in client).toBe(false);
	});
});
