import 'server-only';

import { AGENT_DOCUMENT_CACHE_CONTROL } from '../agentDocumentCacheControl';
import { getLlmsTxt } from './getLlmsTxt';

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
