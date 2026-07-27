import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { NextResponse } from 'next/server';

const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

/**
 * Builds a Markdown response with discovery headers for AI clients.
 */
export function markdownResponse(
  body: string,
  {
    htmlPath,
    request,
  }: {
    htmlPath: string;
    request: Request;
  },
): NextResponse {
  const userAgent = request.headers.get('user-agent') ?? '';
  const referer = request.headers.get('referer') ?? '';
  log.info('markdown_fetch', {
    path: htmlPath,
    ref: referer,
    ua: userAgent,
  });

  const htmlLink = `<${htmlPath === '/' ? '/' : htmlPath}>; rel="alternate"; type="text/html"`;

  return new NextResponse(body, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': MARKDOWN_CONTENT_TYPE,
      Link: htmlLink,
      Vary: 'Accept',
    },
  });
}
