import 'server-only';

import { markdownPagePaths } from '@dg/shared-core/routes/app';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../agentDocumentCacheControl';
import { getPageMarkdown } from '../llm-markdown/pageMarkdown';

export async function GET() {
  const pages = await Promise.all(
    markdownPagePaths.map(async (path) => {
      try {
        return await getPageMarkdown(path);
      } catch {
        return null;
      }
    }),
  );
  return new Response(pages.filter(Boolean).join('\n---\n\n'), {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
