import type { rules } from '@typescript-eslint/eslint-plugin';

type ValueOf<T> = T[keyof T];

/**
 * A full rule has this type
 */
export type Rule = ValueOf<typeof rules>;

/**
 * Type of the create function itself for a rule
 */
export type Create = Rule['create'];

/**
 * The context used in the Create function
 */
export type Context = Parameters<Create>[0];

/**
 * Type of the listener that's returned by create
 */
export type RuleListener = ReturnType<Create>;

/**
 * The main argument passed to `context.report`, with loc undefined to
 * allow us to always use `node`
 */
export type ReportArguments = Parameters<Context['report']>[0] & {
  loc: undefined;
};
