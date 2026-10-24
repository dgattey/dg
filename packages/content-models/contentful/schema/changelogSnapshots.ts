import * as v from 'valibot';
import { assetSchema } from './shared';

export const changelogSnapshotsResponseSchema = v.looseObject({
  assetCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(v.nullable(v.array(v.nullable(assetSchema)))),
      }),
    ),
  ),
});
