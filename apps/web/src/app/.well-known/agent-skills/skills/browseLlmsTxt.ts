/** Skill body for consuming this site via `/llms.txt` and `.md` twins. */
export const browseLlmsTxtSkill = {
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
} as const;
