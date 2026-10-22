import { createHash } from 'node:crypto';

export const AGENT_SKILLS_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const;

const agentSkillsPrefix = '/.well-known/agent-skills' as const;

type AgentSkillDefinition = {
  description: string;
  name: string;
  skillMd: string;
};

/** Skills published for agents consuming this site. */
export const agentSkills = [
  {
    description:
      'Discover public pages on dylangattey.com via /llms.txt and prefer .md links for clean Markdown.',
    name: 'browse-llms-txt',
    skillMd: `---
name: browse-llms-txt
description: Discover public pages on dylangattey.com via /llms.txt and prefer .md links for clean Markdown.
---

# Browse dylangattey.com via llms.txt

Dylan Gattey's personal site publishes a curated agent index at \`/llms.txt\`.

## Steps

1. \`GET https://dylangattey.com/llms.txt\`
2. Read the H1, summary, and \`## Pages\` list
3. Follow the \`.md\` links (for example \`/index.md\`, \`/music.md\`) for token-efficient content
4. Optionally fetch \`/llms-full.txt\` for every public page in one file

## Do not

- Crawl \`/api/*\`, \`/dev-console\`, or \`/llm-markdown\` (internal rewrite target)
- Prefer HTML when a \`.md\` twin is linked from \`llms.txt\`
`,
  },
  {
    description:
      'Fetch Markdown from dylangattey.com with Accept: text/markdown or by requesting the .md twin URL.',
    name: 'markdown-negotiation',
    skillMd: `---
name: markdown-negotiation
description: Fetch Markdown from dylangattey.com with Accept: text/markdown or by requesting the .md twin URL.
---

# Markdown content negotiation

Public HTML pages on this site also expose Markdown.

## Options

1. **\`.md\` twin URL** (preferred when linked from \`llms.txt\`):
   - \`/\` → \`/index.md\`
   - \`/music\` → \`/music.md\`
   - \`/music/albums\` → \`/music/albums.md\`

2. **Accept header** on the HTML path:
   \`\`\`http
   GET /music HTTP/1.1
   Accept: text/markdown
   \`\`\`
   Expect \`Content-Type: text/markdown\` and a \`Link\` alternate header.

## Errors

- Unsupported \`Accept\` types (for example \`application/pdf\`) return **406** with available types listed.
`,
  },
  {
    description:
      'Read Dylan Gattey listening history and favorite albums via Markdown pages and llms.txt links.',
    name: 'music-and-albums',
    skillMd: `---
name: music-and-albums
description: Read Dylan Gattey listening history and favorite albums via Markdown pages and llms.txt links.
---

# Music and albums

Public music surfaces (no API keys required for agents):

| Page | HTML | Markdown |
| --- | --- | --- |
| Recent Spotify plays | \`/music\` | \`/music.md\` |
| Favorite albums | \`/music/albums\` | \`/music/albums.md\` |

## Recommended flow

1. Start from \`/llms.txt\` for absolute \`.md\` links
2. Fetch \`/music.md\` for recent listening history
3. Fetch \`/music/albums.md\` for the all-time favorites grid as Markdown

## Notes

- These pages are public content only. Do not call private \`/api/*\` Spotify or Strava routes.
- HTML pages support \`Accept: text/markdown\` as an alternative to the \`.md\` twin.
`,
  },
] as const satisfies ReadonlyArray<AgentSkillDefinition>;

export function getAgentSkill(name: string): AgentSkillDefinition | undefined {
  return agentSkills.find((skill) => skill.name === name);
}

export function sha256Digest(content: string): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

export function skillArtifactUrl(name: string): string {
  return `${agentSkillsPrefix}/${name}/SKILL.md`;
}

/** Discovery index per Agent Skills Discovery RFC v0.2.0. */
export function getAgentSkillsIndex() {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: agentSkills.map((skill) => ({
      description: skill.description,
      digest: sha256Digest(skill.skillMd),
      name: skill.name,
      type: 'skill-md' as const,
      url: skillArtifactUrl(skill.name),
    })),
  };
}
