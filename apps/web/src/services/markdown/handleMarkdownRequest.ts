import 'server-only';

import { getMarkdownPage, type MarkdownPagePath } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from './getPageMarkdown';
import { markdownResponse } from './markdownResponse';

/**
 * Serves Markdown for a registered public page. Used by the internal
 * `/llm-markdown` route after proxy rewrites from `.md` URLs or Accept negotiation.
 */
export async function handleMarkdownRequest(
  request: Request,
  htmlPath: MarkdownPagePath,
): Promise<Response> {
  try {
    const markdown = await getPageMarkdown(htmlPath);
    if (!markdown) {
      return new Response('Not found', { status: 404 });
    }
    return markdownResponse(markdown, { htmlPath, request });
  } catch {
    const page = getMarkdownPage(htmlPath);
    const fallback = `# ${page.title}\n\n> Content is temporarily unavailable.\n`;
    return markdownResponse(fallback, { htmlPath, request });
  }
}
