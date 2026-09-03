/**
 * @description That a cross-field rule reports the variable at fault.
 *
 * @remarks
 *   The reason `defineEnv` takes checks rather than leaving callers to wrap the schema themselves:
 *   a deployed environment missing a secret has to name that secret. `forward` is what puts the
 *   issue on the right path, and an issue attached to the object instead would tell an operator
 *   only that "the environment" is wrong.
 * @module @tenets/env
 */
import { describe, expect, it } from 'vitest';

import {
	EnvDefinitionError,
	EnvValidationError,
	defineEnv,
	enumValue,
	forbiddenWhenDeployed,
	optionalSecretValue,
	parseEnv,
	requiredWhenDeployed,
	withDefault,
} from './index';

const definition = defineEnv({
	name: 'probe',
	server: {
		VERCEL_ENV: enumValue(['development', 'preview', 'production']),
		DEPLOY_SECRET: optionalSecretValue(8),
		LOCAL_ONLY: withDefault(enumValue(['true', 'false']), 'false'),
	},
	checks: [
		requiredWhenDeployed('DEPLOY_SECRET'),
		forbiddenWhenDeployed('LOCAL_ONLY', 'LOCAL_ONLY is development-only'),
	],
});

const captureThrown = (operation: () => void): unknown => {
	try {
		operation();
	} catch (error) {
		return error;
	}
	throw new Error('expected operation to throw');
};

describe('cross-field env rules', () => {
	it('a local environment may omit the deployed secret', () => {
		expect(parseEnv(definition, { VERCEL_ENV: 'development' }).DEPLOY_SECRET).toBeUndefined();
	});

	it('a deployed environment must carry it, reported against that variable', () => {
		const failure = captureThrown(() => {
			parseEnv(definition, { VERCEL_ENV: 'production' });
		});

		if (!(failure instanceof EnvValidationError)) {
			throw new Error('expected an EnvValidationError');
		}
		expect(failure.issues.map((issue) => issue.path.join('.'))).toContain('DEPLOY_SECRET');
	});

	it('a local-only flag is refused once deployed', () => {
		expect(() =>
			parseEnv(definition, {
				VERCEL_ENV: 'preview',
				DEPLOY_SECRET: 'longenough',
				LOCAL_ONLY: 'true',
			}),
		).toThrow('LOCAL_ONLY is development-only');
	});
});

describe('deployed-rule hardening', () => {
	// object() strips undeclared keys before checks run, so a rule over an
	// undeclared variable would pass vacuously in every environment. The
	// definition must be refused instead of silently guarding nothing.
	it('a deployed rule without a declared VERCEL_ENV is refused as a definition error', () => {
		const undeclaredEnvironment = defineEnv({
			name: 'broken-probe',
			server: { DEPLOY_SECRET: optionalSecretValue(8) },
			checks: [requiredWhenDeployed('DEPLOY_SECRET')],
		});

		expect(() => parseEnv(undeclaredEnvironment, { DEPLOY_SECRET: 'longenough' })).toThrow(
			EnvDefinitionError,
		);
		expect(() => parseEnv(undeclaredEnvironment, { DEPLOY_SECRET: 'longenough' })).toThrow(
			'VERCEL_ENV',
		);
	});

	it('a deployed rule over an undeclared target variable is refused as a definition error', () => {
		const undeclaredTarget = defineEnv({
			name: 'broken-probe',
			server: { VERCEL_ENV: enumValue(['development', 'preview', 'production']) },
			checks: [requiredWhenDeployed('UNDECLARED_SECRET')],
		});

		expect(() => parseEnv(undeclaredTarget, { VERCEL_ENV: 'development' })).toThrow(
			'UNDECLARED_SECRET',
		);
	});
});
