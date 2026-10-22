import 'server-only';

import { changelogRoute } from '@dg/shared-core/routes/app';
import { getChangelogReleases } from '../../services/github';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import { extractReleaseYear, formatReleaseDate, RELEASE_KIND_LABELS } from './changelogHelpers';

export async function getChangelogMarkdown(): Promise<string> {
  try {
    const releases = await getChangelogReleases();
    const sections: Array<string> = [
      '# Changelog',
      `> Version history and release notes for ${SITE_NAME}.`,
    ];

    if (releases.length === 0) {
      sections.push('No releases available.');
    } else {
      const byYear = new Map<string, typeof releases>();
      for (const release of releases) {
        const year = extractReleaseYear(release);
        const list = byYear.get(year) ?? [];
        list.push(release);
        byYear.set(year, list);
      }

      for (const [year, yearReleases] of byYear) {
        const lines = yearReleases.map((release) => {
          const date = formatReleaseDate(release.publishedAt);
          const dateSuffix = date ? ` — ${date}` : '';
          const kind = RELEASE_KIND_LABELS[release.kind];
          const notes =
            release.notes.length > 0 ? `\n${release.notes.map((n) => `  - ${n}`).join('\n')}` : '';
          return `- **[${release.tag}](${release.htmlUrl})** (${kind})${dateSuffix}${notes}`;
        });
        sections.push(`## ${year}`, lines.join('\n'));
      }
    }

    sections.push(relatedPageLinksMarkdown(changelogRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return `# Changelog\n\n> Changelog is unavailable right now.\n`;
  }
}
