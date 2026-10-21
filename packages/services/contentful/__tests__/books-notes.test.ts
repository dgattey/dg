import { ContentfulCmaClient } from '../contentfulCmaClient';
import { runGoodreadsSync, upsertBookToContentful } from '../syncBooksToContentful';

describe('syncBooksToContentful private notes', () => {
  it('upserts notesPlainText as RichText, clears notes when null, and preserves notes during Goodreads sync', async () => {
    const putEntryBodies: Array<Record<string, unknown>> = [];
    let currentFields: Record<string, unknown> = {
      author: { 'en-US': 'Liu Cixin' },
      coverImage: { 'en-US': { sys: { id: 'cov-3bp', linkType: 'Asset', type: 'Link' } } },
      isbn: { 'en-US': 9780765377067 },
      rating: { 'en-US': 5 },
      title: { 'en-US': 'The Three-Body Problem' },
    };

    const fetchMock: typeof fetch = (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('goodreads.com')) {
        return Promise.resolve(
          new Response(
            `<rss><channel><item>
              <book_id>3</book_id><title>The Three-Body Problem</title><author_name>Liu Cixin</author_name>
              <isbn13>9780765377067</isbn13><user_rating>5</user_rating>
              <user_read_at>2025/04/01</user_read_at>
              <user_review><![CDATA[Updated Goodreads review.]]></user_review>
            </item></channel></rss>`,
          ),
        );
      }

      if (url.includes('/assets/cov-3bp') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: { file: { 'en-US': { url: '//images.ctfassets.net/sp/cov-3bp/cover.jpg' } } },
              sys: { id: 'cov-3bp', version: 1 },
            }),
          ),
        );
      }

      if (url.includes('/entries/BOOK-3BP') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: currentFields,
              sys: { id: 'BOOK-3BP', publishedVersion: 2, version: 3 },
            }),
          ),
        );
      }

      if (url.includes('/entries?content_type=book') && method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              items: [
                {
                  fields: currentFields,
                  sys: { id: 'BOOK-3BP', publishedVersion: 2, version: 3 },
                },
              ],
              total: 1,
            }),
          ),
        );
      }

      if (url.includes('/entries/BOOK-3BP') && method === 'PUT' && !url.endsWith('/published')) {
        const parsed = JSON.parse(String(init?.body)) as { fields: Record<string, unknown> };
        putEntryBodies.push(parsed.fields);
        currentFields = parsed.fields;
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: currentFields,
              sys: { id: 'BOOK-3BP', version: 4 },
            }),
          ),
        );
      }

      if (url.includes('/entries/BOOK-3BP/published') && method === 'PUT') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              fields: currentFields,
              sys: { id: 'BOOK-3BP', publishedVersion: 4, version: 5 },
            }),
          ),
        );
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`);
    };

    const cma = new ContentfulCmaClient({
      fetchImpl: fetchMock,
      managementToken: 'tok',
      spaceId: 'sp',
    });

    // 1. Upsert with non-empty notesPlainText -> writes RichText to fields.notes['en-US']
    const withNotes = await upsertBookToContentful(cma, {
      author: 'Liu Cixin',
      id: 'BOOK-3BP',
      isbn: 9780765377067,
      notesPlainText: 'Dark forest hypothesis\n\nRecommended by Alex.',
      reviewPlainText: 'Mind-bending hard sci-fi.',
      title: 'The Three-Body Problem',
    });
    expect(withNotes.action).toBe('updated');
    expect(withNotes.notesText).toBe('Dark forest hypothesis\n\nRecommended by Alex.');
    expect(putEntryBodies[0]?.notes).toEqual({
      'en-US': {
        content: [
          {
            content: [{ data: {}, marks: [], nodeType: 'text', value: 'Dark forest hypothesis' }],
            data: {},
            nodeType: 'paragraph',
          },
          {
            content: [{ data: {}, marks: [], nodeType: 'text', value: 'Recommended by Alex.' }],
            data: {},
            nodeType: 'paragraph',
          },
        ],
        data: {},
        nodeType: 'document',
      },
    });

    // 2. Goodreads RSS sync -> preserves existing fields.notes
    const syncSummary = await runGoodreadsSync({
      contentfulManagementToken: 'tok',
      contentfulSpaceId: 'sp',
      fetchImpl: fetchMock,
      goodreadsUserId: 'u1',
      shelves: ['read'],
    });
    expect(syncSummary.ok).toBe(true);
    expect(syncSummary.updatedCount).toBe(1);
    expect(putEntryBodies[1]?.notes).toEqual(putEntryBodies[0]?.notes);

    // 3. Upsert with notesPlainText: null -> clears fields.notes
    const clearedNotes = await upsertBookToContentful(cma, {
      author: 'Liu Cixin',
      id: 'BOOK-3BP',
      isbn: 9780765377067,
      notesPlainText: null,
      reviewPlainText: 'Updated Goodreads review.',
      title: 'The Three-Body Problem',
    });
    expect(clearedNotes.notesText).toBeNull();
    expect(putEntryBodies[2]).not.toHaveProperty('notes');
  });
});
