import 'server-only';

import { readingRoute } from '@dg/shared-core/routes/app';
import { getBooks } from '../../services/contentful';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import { extractBookYear, formatFinishedMonthYear } from './readingHelpers';

export async function getReadingMarkdown(): Promise<string> {
  try {
    const books = await getBooks();
    const sections: Array<string> = [
      '# Reading',
      `> Books read, star ratings, and notes by year from ${SITE_NAME}`,
    ];

    if (books.length === 0) {
      sections.push('No books available.');
    } else {
      const byYear = new Map<string, typeof books>();
      for (const book of books) {
        const year = extractBookYear(book);
        const list = byYear.get(year) ?? [];
        list.push(book);
        byYear.set(year, list);
      }

      for (const [year, yearBooks] of byYear) {
        const lines = yearBooks.map((book) => {
          const stars = book.rating ? ` (${'★'.repeat(book.rating)})` : '';
          const finished = formatFinishedMonthYear(book.readDateFinished);
          const dateSuffix = finished ? ` — finished ${finished}` : '';
          const noteSuffix = book.review ? `\n  ${book.review.replace(/\s+/g, ' ').trim()}` : '';
          return `- **${book.title}** by ${book.author}${stars}${dateSuffix}${noteSuffix}`;
        });
        sections.push(`## ${year}`, lines.join('\n'));
      }
    }

    sections.push(relatedPageLinksMarkdown(readingRoute));
    return `${sections.join('\n\n')}\n`;
  } catch {
    return `# Reading\n\n> Reading list is unavailable right now.\n`;
  }
}
