import { FALLBACK_BOOKS } from '@dg/content-models/books/fallbackBooks';
import { getContentfulClient } from '../contentfulClient';
import { fetchBooks } from '../fetchBooks';

jest.mock('../contentfulClient', () => ({
  getContentfulClient: jest.fn(),
}));

const mockGetContentfulClient = getContentfulClient as jest.MockedFunction<
  typeof getContentfulClient
>;

describe('fetchBooks', () => {
  const originalSpaceId = process.env.CONTENTFUL_SPACE_ID;
  const originalAccessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  afterEach(() => {
    process.env.CONTENTFUL_SPACE_ID = originalSpaceId;
    process.env.CONTENTFUL_ACCESS_TOKEN = originalAccessToken;
    jest.clearAllMocks();
  });

  it('returns fallback books when Contentful credentials are not configured', async () => {
    delete process.env.CONTENTFUL_SPACE_ID;
    delete process.env.CONTENTFUL_ACCESS_TOKEN;

    const books = await fetchBooks();
    expect(books).toEqual(FALLBACK_BOOKS);
    expect(mockGetContentfulClient).not.toHaveBeenCalled();
  });

  it('returns mapped books from Contentful when present', async () => {
    process.env.CONTENTFUL_SPACE_ID = 'space-123';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'token-123';

    mockGetContentfulClient.mockReturnValue({
      request: jest.fn().mockResolvedValue({
        bookCollection: {
          items: [
            {
              author: 'Frank Herbert',
              rating: 5,
              readDateFinished: '2025-01-04T00:00:00Z',
              readingStatus: 'read',
              reviewDescription: {
                json: {
                  content: [
                    {
                      content: [{ data: {}, marks: [], nodeType: 'text', value: 'An epic read.' }],
                      data: {},
                      nodeType: 'paragraph',
                    },
                  ],
                  data: {},
                  nodeType: 'document',
                },
              },
              sys: { id: 'dune-1' },
              thumbnail: {
                height: 475,
                url: 'https://images.ctfassets.net/space/dune.webp',
                width: 316,
              },
              title: 'Dune (Dune, #1)',
            },
          ],
        },
      }),
    } as unknown as ReturnType<typeof getContentfulClient>);

    const books = await fetchBooks();
    expect(books).toHaveLength(1);
    expect(books[0]).toEqual({
      author: 'Frank Herbert',
      id: 'dune-1',
      rating: 5,
      readDateFinished: '2025-01-04T00:00:00Z',
      readingStatus: 'read',
      review: 'An epic read.',
      thumbnail: {
        height: 475,
        url: 'https://images.ctfassets.net/space/dune.webp',
        width: 316,
      },
      title: 'Dune',
    });
  });

  it('falls back to FALLBACK_BOOKS when Contentful returns an empty collection', async () => {
    process.env.CONTENTFUL_SPACE_ID = 'space-123';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'token-123';

    mockGetContentfulClient.mockReturnValue({
      request: jest.fn().mockResolvedValue({
        bookCollection: { items: [] },
      }),
    } as unknown as ReturnType<typeof getContentfulClient>);

    const books = await fetchBooks();
    expect(books).toEqual(FALLBACK_BOOKS);
  });
});
