import 'server-only';

import { AGENT_DOCUMENT_CACHE_CONTROL } from '../agentDocumentCacheControl';
import { getLlmsFullTxt } from './getLlmsFullTxt';

export async function GET() {
  return new Response(await getLlmsFullTxt(), {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
