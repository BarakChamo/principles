/**
 * @description Explicit Node.js process-environment acquisition boundary.
 *
 * @module @tenets/env/node
 */

/**
 * @description Returns the live process environment for generic passthrough boundaries.
 *
 * @remarks
 *   Application-owned values should still be enumerated and parsed with `parseEnv`. This escape
 *   hatch exists for config interpolation and child-process inheritance, where arbitrary keys are
 *   intentionally part of the contract.
 */
export const readProcessEnv = (): NodeJS.ProcessEnv => process.env;
