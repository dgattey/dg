import * as v from 'valibot';
import { assetSchema } from './shared';

/**
 * Schema for the current location response.
 */
export const currentLocationResponseSchema = v.looseObject({
  contentTypeLocation: v.optional(
    v.nullable(
      v.looseObject({
        image: v.optional(v.nullable(assetSchema)),
        initialZoom: v.optional(v.nullable(v.number())),
        point: v.optional(
          v.nullable(
            v.looseObject({
              latitude: v.optional(v.nullable(v.number())),
              longitude: v.optional(v.nullable(v.number())),
            }),
          ),
        ),
        zoomLevels: v.optional(v.nullable(v.array(v.union([v.string(), v.number()])))),
      }),
    ),
  ),
  darkImage: v.optional(v.nullable(assetSchema)),
  lightImage: v.optional(v.nullable(assetSchema)),
});
