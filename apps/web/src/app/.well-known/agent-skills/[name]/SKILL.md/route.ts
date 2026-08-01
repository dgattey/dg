import 'server-only';

import { getAgentSkill, isAgentSkillName } from '../../agentSkills';

type RouteContext = {
  params: Promise<{ name: string }>;
};

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
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
