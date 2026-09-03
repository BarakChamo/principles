/**
 * @description The validators every environment contract is built from.
 *
 * @remarks
 *   These decide whether a process starts, so their edges are worth pinning: `"false"` is a truthy
 *   string, a URL validator that ignores the scheme accepts `http://` for an endpoint declared
 *   HTTPS, and a secret left at a placeholder is indistinguishable from a real one unless something
 *   checks its length.
 * @module @tenets/env
 */
import { describe, expect, it } from 'vitest';

import {
	decimalStringValue,
	integerValue,
	jsonStringValue,
	nonEmptyStringValue,
	optionalSecretValue,
	secretValue,
	trueFalseFlagValue,
	trueFalseFlagWithDefault,
	urlValueWithScheme,
	uuidValue,
	withDefault,
} from './index';
import type { EnvSchema } from './index';

const accepts = (schema: EnvSchema, input: unknown) => schema.safeParse(input).success;
const output = (schema: EnvSchema, input: unknown) => {
	const parsed = schema.safeParse(input);
	return parsed.success ? parsed.data : undefined;
};

describe('flags', () => {
	it('`false` is false rather than a truthy string', () => {
		// The failure this exists to prevent: a preview-only capability compared as
		// a string is enabled in production, because "false" is truthy.
		expect(output(trueFalseFlagValue, 'false')).toBe(false);
		expect(output(trueFalseFlagValue, 'true')).toBe(true);
	});

	it('anything other than true or false is refused, not coerced', () => {
		for (const value of ['1', '0', 'yes', 'TRUE', ''])
			expect(accepts(trueFalseFlagValue, value)).toBe(false);
	});

	it('a default applies only when the variable is absent', () => {
		expect(output(trueFalseFlagWithDefault(true), undefined)).toBe(true);
		expect(output(trueFalseFlagWithDefault(true), 'false')).toBe(false);
	});
});

describe('secrets', () => {
	it('a secret shorter than its floor is refused', () => {
		expect(accepts(secretValue(32), 'x'.repeat(31))).toBe(false);
		expect(accepts(secretValue(32), 'x'.repeat(32))).toBe(true);
	});

	it('an optional secret is absent or long enough, never short', () => {
		expect(accepts(optionalSecretValue(32), undefined)).toBe(true);
		expect(accepts(optionalSecretValue(32), 'short')).toBe(false);
	});

	it('a length floor cannot be satisfied by an empty default', () => {
		// Worth pinning because it is a tempting mistake: withDefault(secretValue(n), "")
		// declares a default that fails its own validator, so the contract refuses
		// to parse even when the variable is legitimately unset.
		expect(accepts(withDefault(secretValue(8), ''), undefined)).toBe(false);
	});
});

describe('identifiers and numbers', () => {
	it('a uuid must be a uuid', () => {
		expect(accepts(uuidValue, '00000000-0000-7000-8000-000000000001')).toBe(true);
		expect(accepts(uuidValue, 'not-a-uuid')).toBe(false);
	});

	it('an integer arrives as a string and is bounded at both ends', () => {
		const port = integerValue({ min: 1, max: 65_535 });
		expect(output(port, '8080')).toBe(8080);
		expect(accepts(port, '0')).toBe(false);
		expect(accepts(port, '65536')).toBe(false);
		// Not an integer, and not silently truncated.
		expect(accepts(port, '80.5')).toBe(false);
		// Number(" ") is 0 and Number("0x50") is 80; both must be refused rather
		// than coerced into range.
		expect(accepts(port, ' ')).toBe(false);
		expect(accepts(port, '0x50')).toBe(false);
		expect(accepts(port, '8e1')).toBe(false);
	});

	it('a decimal stays a string so the consumer keeps its own precision', () => {
		expect(output(decimalStringValue, '0.0000006')).toBe('0.0000006');
		expect(accepts(decimalStringValue, 'not-a-number')).toBe(false);
	});

	it('a non-empty string rejects a variable that is set but blank', () => {
		expect(accepts(nonEmptyStringValue, '')).toBe(false);
		expect(accepts(nonEmptyStringValue, 'iad1')).toBe(true);
	});
});

describe('scheme-restricted urls', () => {
	it('a URL declared HTTPS refuses plain http', () => {
		// z.url() alone accepts any scheme, which for a media source or provider
		// callback is the difference between a private fetch and one a network can
		// rewrite.
		const https = urlValueWithScheme('https://');
		expect(accepts(https, 'https://assets.example.com/pack.zip')).toBe(true);
		expect(accepts(https, 'http://assets.example.com/pack.zip')).toBe(false);
	});
});

describe('json-bearing values', () => {
	it('a key that does not parse is refused at the boundary', () => {
		// A malformed JWK otherwise surfaces as a signing failure at its first
		// use, a long way from the variable that caused it.
		expect(accepts(jsonStringValue, '{"kty":"OKP"}')).toBe(true);
		expect(accepts(jsonStringValue, '{not json')).toBe(false);
	});
});
