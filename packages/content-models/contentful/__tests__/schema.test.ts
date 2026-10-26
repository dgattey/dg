import { safeParse } from 'valibot';
import { deriveReadingStatus, toRenderableBook } from '../renderables/books';
import { booksResponseSchema } from '../schema/books';
import { footerLinksResponseSchema } from '../schema/footer';
import { introBlockResponseSchema } from '../schema/intro';
import { currentLocationResponseSchema } from '../schema/location';
import { projectsResponseSchema } from '../schema/projects';

describe('contentful schemas', () => {
  it('parses intro block responses', () => {
    const input = {
      asset: {
        __typename: 'Asset',
        height: 660,
        title: 'Intro image',
        url: 'https://example.com/intro.webp',
        width: 660,
      },
      textBlockCollection: {
        __typename: 'TextBlockCollection',
        items: [
          {
            content: {
              json: { content: [], nodeType: 'document' },
              links: {
                assets: { block: [] },
                entries: { block: [], inline: [] },
              },
            },
          },
        ],
      },
    };

    expect(safeParse(introBlockResponseSchema, input).success).toBe(true);
  });

  it('parses footer link and textBlock responses', () => {
    const input = {
      sectionCollection: {
        __typename: 'SectionCollection',
        items: [
          {
            blocksCollection: {
              items: [
                {
                  content: {
                    json: { content: [], nodeType: 'document' },
                    links: {
                      assets: { block: [] },
                      entries: { block: [], inline: [] },
                    },
                  },
                },
                { icon: null, title: 'Link', url: 'https://example.com' },
              ],
            },
          },
        ],
      },
    };

    expect(safeParse(footerLinksResponseSchema, input).success).toBe(true);
  });

  it('parses project list responses', () => {
    const input = {
      projectCollection: {
        __typename: 'ProjectCollection',
        items: [
          {
            __typename: 'Project',
            creationDate: '2024-01-01',
            description: { json: { content: [], nodeType: 'document' } },
            isSideProject: false,
            layout: 'default',
            link: { url: 'https://example.com' },
            summary: null,
            thumbnail: {
              height: 480,
              url: 'https://example.com/image.webp',
              width: 640,
            },
            title: 'Project',
            type: ['Web', 'OpenSource'],
          },
          {
            __typename: 'Project',
            creationDate: '2026-07-01',
            isSideProject: true,
            link: { url: 'https://wmm.gattey.com' },
            summary: 'See what you own and where it sits',
            thumbnail: {
              height: 80,
              url: 'https://images.ctfassets.net/example/wmm.webp',
              width: 80,
            },
            title: 'WMM',
          },
        ],
      },
    };

    expect(safeParse(projectsResponseSchema, input).success).toBe(true);
  });

  it('parses current location responses', () => {
    const input = {
      contentTypeLocation: {
        __typename: 'Location',
        image: { height: 170, url: 'https://example.com/map.webp', width: 170 },
        initialZoom: 8,
        point: { latitude: 37.5, longitude: -122.4 },
        title: 'San Francisco',
        zoomLevels: [3, '8', 18],
      },
    };

    expect(safeParse(currentLocationResponseSchema, input).success).toBe(true);
  });

  it('parses book collection responses, derives readingStatus from dates, and filters out notStarted books', () => {
    const input = {
      bookCollection: {
        __typename: 'BookCollection',
        items: [
          {
            __typename: 'Book',
            author: 'Frank Herbert',
            coverImage: {
              height: 475,
              url: 'https://images.ctfassets.net/space/dune.webp',
              width: 316,
            },
            rating: 5,
            readDateFinished: '2025-01-04T00:00:00Z',
            readDateStarted: '2024-12-20T00:00:00Z',
            reviewDescription: {
              json: {
                content: [
                  {
                    content: [{ data: {}, marks: [], nodeType: 'text', value: 'Epic novel.' }],
                    data: {},
                    nodeType: 'paragraph',
                  },
                ],
                data: {},
                nodeType: 'document',
              },
            },
            sys: { id: 'book-dune' },
            title: 'Dune',
          },
          {
            __typename: 'Book',
            author: 'Ursula K. Le Guin',
            readDateFinished: null,
            readDateStarted: '2026-10-01T00:00:00Z',
            sys: { id: 'book-dispossessed' },
            title: 'The Dispossessed',
          },
          {
            __typename: 'Book',
            author: 'Neal Stephenson',
            readDateFinished: null,
            readDateStarted: null,
            sys: { id: 'book-anathem' },
            title: 'Anathem',
          },
        ],
        total: 3,
      },
    };

    const parsed = safeParse(booksResponseSchema, input);
    expect(parsed.success).toBe(true);

    expect(
      deriveReadingStatus({
        readDateFinished: '2025-01-04T00:00:00Z',
        readDateStarted: '2024-12-20T00:00:00Z',
      }),
    ).toBe('read');
    expect(
      deriveReadingStatus({
        readDateFinished: null,
        readDateStarted: '2026-10-01T00:00:00Z',
      }),
    ).toBe('reading');
    expect(deriveReadingStatus({ readDateFinished: null, readDateStarted: null })).toBe(
      'notStarted',
    );
    expect(
      deriveReadingStatus({
        readDateFinished: null,
        readDateStarted: null,
        readingStatus: 'read',
      }),
    ).toBe('read');

    expect(
      toRenderableBook({
        author: 'S.E. Hinton',
        rating: 5,
        readDateFinished: null,
        readDateStarted: null,
        readingStatus: 'read',
        sys: { id: 'book-outsiders' },
        title: 'The Outsiders',
      }),
    ).toEqual({
      author: 'S.E. Hinton',
      id: 'book-outsiders',
      rating: 5,
      readDateFinished: null,
      readingStatus: 'read',
      review: null,
      thumbnail: null,
      title: 'The Outsiders',
    });

    expect(toRenderableBook(input.bookCollection.items[0])).toEqual({
      author: 'Frank Herbert',
      id: 'book-dune',
      rating: 5,
      readDateFinished: '2025-01-04T00:00:00Z',
      readingStatus: 'read',
      review: 'Epic novel.',
      thumbnail: {
        height: 475,
        url: 'https://images.ctfassets.net/space/dune.webp',
        width: 316,
      },
      title: 'Dune',
    });

    expect(toRenderableBook(input.bookCollection.items[1])).toEqual({
      author: 'Ursula K. Le Guin',
      id: 'book-dispossessed',
      rating: null,
      readDateFinished: null,
      readingStatus: 'reading',
      review: null,
      thumbnail: null,
      title: 'The Dispossessed',
    });

    expect(toRenderableBook(input.bookCollection.items[2])).toBeNull();
  });
});
