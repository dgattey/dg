import * as v from 'valibot';

/**
 * Shared primitives and reusable content models for Contentful responses.
 * Keep these minimal and focused on fields we actually use.
 */

/**
 * Contentful `sys` metadata used for linking entries/assets in rich text.
 */
const sysSchema = v.looseObject({
  id: v.string(),
});

/**
 * Base asset fields used across responses.
 */
const assetFields = {
  description: v.optional(v.nullable(v.string())),
  fileName: v.optional(v.nullable(v.string())),
  height: v.optional(v.nullable(v.number())),
  title: v.optional(v.nullable(v.string())),
  url: v.optional(v.nullable(v.string())),
  width: v.optional(v.nullable(v.number())),
};

/**
 * Asset without `sys` (used in direct queries).
 */
export const assetSchema = v.looseObject({
  ...assetFields,
  sys: v.optional(sysSchema),
});

/**
 * Asset with `sys` (used in rich text links).
 */
const assetWithSysSchema = v.looseObject({
  ...assetFields,
  sys: sysSchema,
});

/**
 * Link fields used in header/footer and rich text.
 */
const linkFields = {
  icon: v.optional(v.nullable(v.string())),
  title: v.optional(v.nullable(v.string())),
  url: v.optional(v.nullable(v.string())),
};

/**
 * Link without `sys` (used in direct queries).
 */
export const linkSchema = v.looseObject(linkFields);

/**
 * Link with `sys` (used in rich text links).
 */
const linkWithSysSchema = v.looseObject({
  ...linkFields,
  sys: sysSchema,
});

/**
 * Project content used for the homepage grid.
 */
const projectFields = {
  creationDate: v.optional(v.nullable(v.string())),
  isSideProject: v.optional(v.nullable(v.boolean())),
  layout: v.optional(v.nullable(v.string())),
  link: v.optional(
    v.nullable(
      v.looseObject({
        url: v.optional(v.nullable(v.string())),
      }),
    ),
  ),
  summary: v.optional(v.nullable(v.string())),
  thumbnail: v.optional(
    v.nullable(
      v.looseObject({
        height: v.optional(v.nullable(v.number())),
        url: v.optional(v.nullable(v.string())),
        width: v.optional(v.nullable(v.number())),
      }),
    ),
  ),
  title: v.optional(v.nullable(v.string())),
  type: v.optional(v.nullable(v.union([v.string(), v.array(v.string())]))),
};

/**
 * Project entry without `sys` (used in project lists).
 */
export const projectSchema = v.looseObject(projectFields);

/**
 * Rich text content payload with linked assets/entries.
 */
const richTextContentSchema = v.looseObject({
  json: v.unknown(),
  links: v.looseObject({
    assets: v.looseObject({
      block: v.array(v.nullable(assetWithSysSchema)),
    }),
    entries: v.looseObject({
      block: v.array(v.nullable(linkWithSysSchema)),
      inline: v.array(v.nullable(linkWithSysSchema)),
    }),
  }),
});

/**
 * Text block wrapper used by the intro and footer queries.
 */
export const textBlockSchema = v.looseObject({
  content: v.nullable(richTextContentSchema),
  slug: v.optional(v.nullable(v.string())),
  title: v.optional(v.nullable(v.string())),
});

/**
 * Nested Section ("Link collection") block used in header and footer sections.
 */
export const linkSectionSchema = v.looseObject({
  blocksCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(v.nullable(v.array(v.nullable(linkSchema)))),
      }),
    ),
  ),
  slug: v.optional(v.nullable(v.string())),
  title: v.optional(v.nullable(v.string())),
});

export type Asset = v.InferOutput<typeof assetSchema>;
export type AssetWithSys = v.InferOutput<typeof assetWithSysSchema>;
export type Link = v.InferOutput<typeof linkSchema>;
export type LinkSection = v.InferOutput<typeof linkSectionSchema>;
export type LinkWithSys = v.InferOutput<typeof linkWithSysSchema>;
export type Project = v.InferOutput<typeof projectSchema>;
export type RichTextContent = v.InferOutput<typeof richTextContentSchema>;
export type TextBlock = v.InferOutput<typeof textBlockSchema>;
