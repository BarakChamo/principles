/**
 * @description Compile-time contract for the inferred environment types: extension merging, client/server split,
 * and exactness.
 *
 * @remarks
 *   Named `.test-d.ts` because it has no runtime assertions — `tsc` verifies it during `bun run
 *   check`, and the test runner should not try to collect a file that would pass whatever the
 *   implementation did.
 * @module @tenets/env
 */

import { expectTypeOf } from 'vitest';
import { z } from 'zod';

import { defineEnv, parseEnv, stringValue } from './index';
import { defineNextEnv, parseNextEnv } from './next';

const packageDefinition = defineEnv({
	name: 'package',
	server: { PACKAGE_TOKEN: stringValue },
});
const applicationDefinition = defineEnv({
	name: 'application',
	extends: [packageDefinition],
	server: {
		PORT: z.string().transform(Number).pipe(z.number()),
	},
});
const applicationEnv = parseEnv(applicationDefinition, {
	PACKAGE_TOKEN: 'token',
	PORT: '3000',
});

expectTypeOf(applicationEnv.PACKAGE_TOKEN).toBeString();
expectTypeOf(applicationEnv.PORT).toBeNumber();
// @ts-expect-error Undeclared variables are not exposed.
expectTypeOf(applicationEnv.UNKNOWN).toBeUnknown();

const nextDefinition = defineNextEnv({
	name: 'web',
	client: { NEXT_PUBLIC_URL: stringValue },
	server: { DATABASE_URL: stringValue },
});

parseNextEnv(nextDefinition, {
	DATABASE_URL: 'postgres://localhost/app',
	NEXT_PUBLIC_URL: 'https://example.com',
});

const verifyRejectedTypes = (): void => {
	// @ts-expect-error Next.js runtime mappings must include every declared key.
	parseNextEnv(nextDefinition, { NEXT_PUBLIC_URL: 'https://example.com' });

	defineNextEnv({
		name: 'invalid-web',
		client: {
			// @ts-expect-error Next.js client variables require the NEXT_PUBLIC_ prefix.
			PUBLIC_URL: stringValue,
		},
	});
};

expectTypeOf(verifyRejectedTypes).toBeFunction();
