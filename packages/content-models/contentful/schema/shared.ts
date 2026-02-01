import * as v from 'valibot';

/**
 * Shared primitives and reusable content models for Contentful responses.
 * Keep these minimal and focused on fields we actually use.
 */

/**
 * Contentful `sys` metadata used for linking entries/assets in rich text.
 */
export const sysSchema = v.looseObject({
  id: v.string(),
});

/**
 * Base asset fields used across responses.
 */
const assetFields = {
  description: v.optional(v.nullable(v.string())),
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
export const assetWithSysSchema = v.looseObject({
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
export const linkWithSysSchema = v.looseObject({
  ...linkFields,
  sys: sysSchema,
});

/**
 * Project content used for the homepage grid.
 */
const projectFields = {
  creationDate: v.optional(v.nullable(v.string())),
  description: v.optional(
    v.nullable(
      v.looseObject({
        json: v.unknown(),
      }),
    ),
  ),
  layout: v.optional(v.nullable(v.string())),
  link: v.optional(
    v.nullable(
      v.looseObject({
        url: v.optional(v.nullable(v.string())),
      }),
    ),
  ),
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
 * Project entry with `sys` (used in rich text links).
 */
export const projectWithSysSchema = v.looseObject({
  ...projectFields,
  sys: sysSchema,
});

/**
 * Rich text entries we can render inline or as blocks.
 */
export const entrySchema = v.union([linkWithSysSchema, projectWithSysSchema]);

/**
 * Rich text content payload with linked assets/entries.
 */
export const richTextContentSchema = v.looseObject({
  json: v.unknown(),
  links: v.looseObject({
    assets: v.looseObject({
      block: v.array(v.nullable(assetWithSysSchema)),
    }),
    entries: v.looseObject({
      block: v.array(v.nullable(entrySchema)),
      inline: v.array(v.nullable(entrySchema)),
    }),
  }),
});

/**
 * Text block wrapper used by the intro query.
 */
export const textBlockSchema = v.looseObject({
  content: v.nullable(richTextContentSchema),
});

export type Asset = v.InferOutput<typeof assetSchema>;
export type AssetWithSys = v.InferOutput<typeof assetWithSysSchema>;
export type Link = v.InferOutput<typeof linkSchema>;
export type LinkWithSys = v.InferOutput<typeof linkWithSysSchema>;
export type Project = v.InferOutput<typeof projectSchema>;
export type ProjectWithSys = v.InferOutput<typeof projectWithSysSchema>;
export type Entry = v.InferOutput<typeof entrySchema>;
export type RichTextContent = v.InferOutput<typeof richTextContentSchema>;
export type TextBlock = v.InferOutput<typeof textBlockSchema>;
