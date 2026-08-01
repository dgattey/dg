import { vercelAdapter } from '@flags-sdk/vercel';
import { flag } from 'flags/next';

/**
 * Gates the interactive redesign surface.
 * Falls back to false when FLAGS is missing (CI/tests) or evaluation fails.
 */
export const interactiveRedesign = flag({
  adapter: vercelAdapter,
  defaultValue: false,
  description: 'The new redesign that adds interactivity and maps to more of the site',
  key: 'interactive-redesign',
});
