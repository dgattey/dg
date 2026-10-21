import * as v from 'valibot';
import { linkSchema, textBlockSchema } from './shared';

export const footerBlockSchema = v.union([textBlockSchema, linkSchema]);

/**
 * Schema for footer blocks (TextBlock description + Link items).
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
