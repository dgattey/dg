import 'server-only';

import { log } from '@dg/shared-core/helpers/log';
import { type BaseIssue, type BaseSchema, flatten, type InferOutput, safeParse } from 'valibot';

type ParseContext = {
  kind: 'graphql' | 'rest';
  source: string;
};

export const parseResponse = <
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  context: ParseContext,
): InferOutput<TSchema> => {
  const result = safeParse(schema, input);
  if (result.success) {
    return result.output;
  }

  const issues = result.issues ? flatten(result.issues) : undefined;
  log.error('Response validation failed', {
    context,
    issues,
  });

  const details = issues ? ` (${JSON.stringify(issues)})` : '';
  throw new Error(`Invalid ${context.kind} response for ${context.source}${details}`);
};
