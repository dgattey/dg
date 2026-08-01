import 'server-only';

import { getAgentSkillsIndex } from '../agentSkills';

export function GET() {
  return Response.json(getAgentSkillsIndex(), {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
    },
  });
}
