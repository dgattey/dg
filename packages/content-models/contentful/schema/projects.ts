import * as v from 'valibot';
import { projectSchema } from './shared';

/**
 * Schema for the list of projects on the homepage.
 */
export const projectsResponseSchema = v.looseObject({
  projectCollection: v.optional(
    v.nullable(
      v.looseObject({
        items: v.optional(v.nullable(v.array(v.nullable(projectSchema)))),
      }),
    ),
  ),
});
