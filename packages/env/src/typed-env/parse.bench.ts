/**
 * @description Benchmarks the compiled-schema cache: repeated parses of one definition reuse the
 * z.compile fast path; a fresh definition per parse pays schema construction and compilation every
 * time. Run with `npm run bench`.
 *
 * @module @tenets/env
 */
import { bench, describe } from 'vitest';

import { defineEnv, enumValue, integerValue, parseEnv, stringValue, urlValue } from './index';

const shape = {
	API_URL: urlValue,
	MODE: enumValue(['a', 'b', 'c']),
	NAME: stringValue,
	PORT: integerValue({ min: 1, max: 65_535 }),
	REGION: stringValue,
	TOKEN: stringValue,
} as const;

const source = {
	API_URL: 'https://api.example.com',
	MODE: 'b',
	NAME: 'svc',
	PORT: '8080',
	REGION: 'iad1',
	TOKEN: 'secret-token',
};

const cached = defineEnv({ name: 'cached', server: shape });

describe('parseEnv', () => {
	bench('cached compiled definition (steady state)', () => {
		parseEnv(cached, source);
	});

	bench('fresh definition per parse (cold: build + compile every time)', () => {
		parseEnv(defineEnv({ name: 'fresh', server: shape }), source);
	});
});
