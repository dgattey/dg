import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { NextResponse } from 'next/server';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../agentDocumentCacheControl';

/**
 * Markdown response with Link/Vary headers for AI clients.
 */
export function markdownResponse(
  body: string,
  { htmlPath, request }: { htmlPath: string; request: Request },
): NextResponse {
  log.info('markdown_fetch', {
    path: htmlPath,
    ref: request.headers.get('referer') ?? '',
    ua: request.headers.get('user-agent') ?? '',
  });

  return new NextResponse(body, {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${htmlPath}>; rel="alternate"; type="text/html"`,
      Vary: 'Accept',
    },
  });
}
