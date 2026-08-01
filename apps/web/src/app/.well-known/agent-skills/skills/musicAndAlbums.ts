/** Skill body for music listening history and favorite albums. */
export const musicAndAlbumsSkill = {
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
} as const;
