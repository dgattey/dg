import * as v from 'valibot';
import { linkSchema } from './shared';

/**
 * Schema for footer blocks.
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
                          items: v.optional(v.nullable(v.array(v.nullable(linkSchema)))),
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
