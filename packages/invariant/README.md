# @tenets/invariant

`invariant(condition, message)` asserting impossible internal states, throwing `InvariantError`
with stable code/details metadata, plus `createInvariant` for production message stripping. Never
catch an invariant failure to recover (Rule 2.2). Copy into your workspace or depend directly; the
rules fix the API names, your project guide records the location (Rule 7.6).
