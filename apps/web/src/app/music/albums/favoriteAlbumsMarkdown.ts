import 'server-only';

import { albumRoute, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { getFavoriteAlbums } from '../../../services/albums';
import { relatedPageLinksMarkdown } from '../../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../../metadata';

/**
 * Markdown representation of favorite albums — kept next to the albums page.
 * Per-album HTML wells are intentionally omitted from markdownPages: the
 * registry is a static list, and each album is already linked here with its
 * shareable `/music/albums?album=:id` URL plus the Spotify external URL.
 */
export async function getFavoriteAlbumsMarkdown(): Promise<string> {
  try {
    const albums = await getFavoriteAlbums();
    const sections: Array<string> = [
      '# Favorite albums',
      `> All-time favorite albums from ${SITE_NAME}`,
    ];

    if (!albums || albums.length === 0) {
      sections.push('No albums available.');
    } else {
      sections.push(
        '## Albums',
        albums
          .map(
            (album) =>
              `- [${album.name}](${albumRoute(album.id)}) — ${album.artistNames} (released ${album.releaseDate}; [Spotify](${album.url}))`,
          )
          .join('\n'),
      );
    }

    sections.push(relatedPageLinksMarkdown(favoriteAlbumsRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return `# Favorite albums\n\n> Favorite albums are unavailable right now.\n`;
  }
}
