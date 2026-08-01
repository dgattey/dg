/** Skill body for Accept negotiation and `.md` URL twins. */
export const markdownNegotiationSkill = {
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
} as const;
