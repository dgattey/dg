import * as v from 'valibot';
import { assetSchema } from './shared';

/**
 * Side project fields used by the homepage side-projects card.
 */
export const sideProjectSchema = v.looseObject({
  description: v.optional(v.nullable(v.string())),
  mark: v.optional(v.nullable(assetSchema)),
  publishedAt: v.optional(v.nullable(v.string())),
  title: v.optional(v.nullable(v.string())),
  url: v.optional(v.nullable(v.string())),
});

/**
 * Schema for the newest published side projects on the homepage.
 */
export const sideProjectsResponseSchema = v.looseObject({
  sideProjectCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(v.nullable(v.array(v.nullable(sideProjectSchema)))),
      }),
    ),
  ),
});

export type SideProject = v.InferOutput<typeof sideProjectSchema>;
