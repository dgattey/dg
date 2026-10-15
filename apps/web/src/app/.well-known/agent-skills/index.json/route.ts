import 'server-only';

import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../../agentDocumentCacheControl';
import { getAgentSkillsIndex } from '../agentSkills';

export function GET() {
  return Response.json(getAgentSkillsIndex(), {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
    },
  });
}
