import * as v from 'valibot';
import { linkSchema, linkSectionSchema, textBlockSchema } from './shared';

const footerBlockSchema = v.union([textBlockSchema, linkSectionSchema, linkSchema]);
const headerBlockSchema = v.union([linkSectionSchema, linkSchema]);

/**
 * Schema for footer blocks (TextBlock description, nested Elsewhere Section, and Link items).
 */
export const footerLinksResponseSchema = v.looseObject({
  sectionCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(
          v.nullable(
            v.array(
              v.optional(
                v.nullable(
                  v.looseObject({
                    blocksCollection: v.optional(
                      v.nullable(
                        v.looseObject({
                          items: v.optional(v.nullable(v.array(v.nullable(footerBlockSchema)))),
                        }),
                      ),
                    ),
                    slug: v.optional(v.nullable(v.string())),
                    title: v.optional(v.nullable(v.string())),
                  }),
                ),
              ),
            ),
          ),
        ),
      }),
    ),
  ),
});

/**
 * Schema for header navigation blocks (nested dropdown Section menus and top-level Link items).
 */
export const headerSectionResponseSchema = v.looseObject({
  sectionCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(
          v.nullable(
            v.array(
              v.optional(
                v.nullable(
                  v.looseObject({
                    blocksCollection: v.optional(
                      v.nullable(
                        v.looseObject({
                          items: v.optional(v.nullable(v.array(v.nullable(headerBlockSchema)))),
                        }),
                      ),
                    ),
                    slug: v.optional(v.nullable(v.string())),
                    title: v.optional(v.nullable(v.string())),
                  }),
                ),
              ),
            ),
          ),
        ),
      }),
    ),
  ),
});
