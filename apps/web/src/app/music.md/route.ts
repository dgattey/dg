import 'server-only';

import { musicRoute } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from '../../services/markdown/getPageMarkdown';
import { markdownResponse } from '../../services/markdown/markdownResponse';

/**
 * Markdown twin for `/music` at `/music.md`.
 */
export async function GET(request: Request) {
  try {
    const markdown = await getPageMarkdown(musicRoute);
    if (!markdown) {
      return new Response('Not found', { status: 404 });
    }
    return markdownResponse(markdown, { htmlPath: musicRoute, request });
  } catch {
    const fallback = `# Listening history\n\n> Recent Spotify plays are unavailable right now.\n`;
    return markdownResponse(fallback, { htmlPath: musicRoute, request });
  }
}
