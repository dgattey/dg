import 'server-only';

import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../../../agentDocumentCacheControl';
import { agentSkills, getAgentSkill, isAgentSkillName } from '../../agentSkills';

type RouteContext = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return agentSkills.map(({ name }) => ({ name }));
}

export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params;
  if (!isAgentSkillName(name)) {
    return new Response('Not Found\n', { status: 404 });
  }

  const skill = getAgentSkill(name);
  if (!skill) {
    return new Response('Not Found\n', { status: 404 });
  }

  return new Response(skill.skillMd, {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
