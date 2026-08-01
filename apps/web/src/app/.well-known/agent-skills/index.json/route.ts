import 'server-only';

import { agentSkillsIndexRoute } from '@dg/shared-core/routes/app';
import { getAgentSkillsIndex } from '../skills';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
  'Content-Type': 'application/json; charset=utf-8',
  Link: `<${agentSkillsIndexRoute}>; rel="agent-skills"; type="application/json"`,
};

export function GET() {
  return new Response(JSON.stringify(getAgentSkillsIndex()), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
