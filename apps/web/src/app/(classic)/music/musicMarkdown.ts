import 'server-only';

import { musicRoute } from '@dg/shared-core/routes/app';
import { getMusicHistory } from '../../../services/music';
import { relatedPageLinksMarkdown } from '../../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../../metadata';

/**
 * Markdown representation of listening history — kept next to the music page.
 */
export async function getMusicMarkdown(): Promise<string> {
  try {
    const { tracks } = await getMusicHistory({});
    const sections: Array<string> = [
      '# Listening history',
      `> Recent Spotify plays from ${SITE_NAME}`,
    ];

    if (tracks.length === 0) {
      sections.push('No recent plays available.');
    } else {
      sections.push(
        '## Recent plays',
        tracks
          .map((track) => {
            const playedAt = new Date(track.playedAt).toISOString();
            return `- [${track.trackName}](${track.url}) — ${track.artistNames} (${track.albumName}), played ${playedAt}`;
          })
          .join('\n'),
      );
    }

    sections.push(relatedPageLinksMarkdown(musicRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return `# Listening history\n\n> Recent Spotify plays are unavailable right now.\n`;
  }
}
