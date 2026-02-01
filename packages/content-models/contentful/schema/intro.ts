import * as v from 'valibot';
import { assetSchema, textBlockSchema } from './shared';

/**
 * Schema for intro block responses.
 */
export const introBlockResponseSchema = v.looseObject({
  asset: v.optional(v.nullable(assetSchema)),
  textBlockCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(v.nullable(v.array(v.nullable(textBlockSchema)))),
      }),
    ),
  ),
});
