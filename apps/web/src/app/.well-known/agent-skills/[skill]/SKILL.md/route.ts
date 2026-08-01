import 'server-only';

import { notFound } from 'next/navigation';
import { getAgentSkillMarkdown, isAgentSkillName } from '../../skills';

type RouteParams = {
  params: Promise<{ skill: string }>;
};

const markdownHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
  'Content-Type': 'text/markdown; charset=utf-8',
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { skill } = await params;
  if (!isAgentSkillName(skill)) {
    notFound();
  }

  return new Response(getAgentSkillMarkdown(skill), { headers: markdownHeaders });
}

export async function HEAD(_request: Request, { params }: RouteParams) {
  const { skill } = await params;
  if (!isAgentSkillName(skill)) {
    notFound();
  }

  return new Response(null, { headers: markdownHeaders });
}
