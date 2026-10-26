import fs from 'node:fs';
import path from 'node:path';
import { buildSchema, parse, validate } from 'graphql';
import { getContentfulClient } from '../contentfulClient';
import { fetchBooks } from '../fetchBooks';

jest.mock('../contentfulClient', () => ({
  getContentfulClient: jest.fn(),
}));

const mockGetContentfulClient = getContentfulClient as jest.MockedFunction<
  typeof getContentfulClient
>;

const SCHEMA_PATH = path.resolve(__dirname, '../../../content-models/contentful/schema.graphql');
const CONTENTFUL_SERVICES_DIR = path.resolve(__dirname, '..');

describe('fetchBooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('queries coverImage and read dates, derives readingStatus, filters notStarted, and paginates across pages', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce({
        bookCollection: {
          items: [
            {
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
              title: 'Dune',
            },
            {
              author: 'Neal Stephenson',
              coverImage: null,
              rating: null,
              readDateFinished: null,
              readDateStarted: null,
              reviewDescription: null,
              sys: { id: 'anathem-to-read' },
              title: 'Anathem',
            },
          ],
          total: 3,
        },
      })
      .mockResolvedValueOnce({
        bookCollection: {
          items: [
            {
              author: 'Ursula K. Le Guin',
              coverImage: null,
              rating: null,
              readDateFinished: null,
              readDateStarted: '2026-10-01T00:00:00Z',
              reviewDescription: null,
              sys: { id: 'dispossessed-1' },
              title: 'The Dispossessed',
            },
          ],
          total: 3,
        },
      });

    mockGetContentfulClient.mockReturnValue({
      request,
    } as unknown as ReturnType<typeof getContentfulClient>);

    const books = await fetchBooks();
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenNthCalledWith(1, expect.stringContaining('coverImage'), {
      limit: 200,
      skip: 0,
    });
    expect(request).toHaveBeenNthCalledWith(2, expect.stringContaining('coverImage'), {
      limit: 200,
      skip: 2,
    });
    expect(books).toEqual([
      {
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
      },
      {
        author: 'Ursula K. Le Guin',
        id: 'dispossessed-1',
        rating: null,
        readDateFinished: null,
        readingStatus: 'reading',
        review: null,
        thumbnail: null,
        title: 'The Dispossessed',
      },
    ]);
  });

  it('normalizes backfilled shelf-addition dates to null and deduplicates matching editions', async () => {
    const request = jest.fn().mockResolvedValueOnce({
      bookCollection: {
        items: [
          {
            author: 'S.E. Hinton',
            coverImage: null,
            rating: 5,
            readDateFinished: '2023-07-24T06:00:00.000Z',
            readDateStarted: '2023-07-24T06:00:00.000Z',
            reviewDescription: null,
            sys: { id: 'outsiders-1' },
            title: 'The Outsiders',
          },
          {
            author: 'Neil Gaiman',
            coverImage: null,
            rating: 5,
            readDateFinished: '2019-01-15T06:00:00.000Z',
            readDateStarted: '2019-01-15T06:00:00.000Z',
            reviewDescription: null,
            sys: { id: 'american-gods-10th' },
            title: 'American Gods: Tenth Anniversary',
          },
          {
            author: 'Neil Gaiman',
            coverImage: null,
            rating: 5,
            readDateFinished: null,
            readDateStarted: null,
            reviewDescription: null,
            sys: { id: 'american-gods' },
            title: 'American Gods',
          },
        ],
        total: 3,
      },
    });

    mockGetContentfulClient.mockReturnValue({
      request,
    } as unknown as ReturnType<typeof getContentfulClient>);

    const books = await fetchBooks();
    expect(books).toEqual([
      {
        author: 'S.E. Hinton',
        id: 'outsiders-1',
        rating: 5,
        readDateFinished: null,
        readingStatus: 'read',
        review: null,
        thumbnail: null,
        title: 'The Outsiders',
      },
      {
        author: 'Neil Gaiman',
        id: 'american-gods',
        rating: 5,
        readDateFinished: null,
        readingStatus: 'read',
        review: null,
        thumbnail: null,
        title: 'American Gods',
      },
    ]);
  });

  it('propagates GraphQL errors instead of silently masking them with fallback data', async () => {
    mockGetContentfulClient.mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error('GraphQL validation error (400)')),
    } as unknown as ReturnType<typeof getContentfulClient>);

    await expect(fetchBooks()).rejects.toThrow('GraphQL validation error (400)');
  });
});

describe('Contentful GraphQL query schema validation', () => {
  const schema = buildSchema(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  it('validates every gql query in packages/services/contentful/*.ts against schema.graphql', () => {
    const serviceFiles = fs
      .readdirSync(CONTENTFUL_SERVICES_DIR)
      .filter((file) => file.endsWith('.ts'))
      .sort();

    let validatedQueries = 0;
    const violations: Array<string> = [];

    for (const file of serviceFiles) {
      const content = fs.readFileSync(path.join(CONTENTFUL_SERVICES_DIR, file), 'utf8');
      for (const match of content.matchAll(/gql`([\s\S]*?)`/g)) {
        validatedQueries += 1;
        const querySource = (match[1] ?? '').replace(/\$\{[^}]+\}/g, '1');
        const document = parse(querySource);
        for (const error of validate(schema, document)) {
          violations.push(`${file}: ${error.message}`);
        }
      }
    }

    expect(validatedQueries).toBeGreaterThanOrEqual(7);
    expect(violations).toEqual([]);
  });

  it('rejects nonexistent Book fields such as thumbnail or readingStatus', () => {
    const invalidDoc = parse(`
      query BrokenBooks {
        bookCollection {
          items {
            readingStatus
            thumbnail {
              url
            }
          }
        }
      }
    `);
    const messages = validate(schema, invalidDoc).map((error) => error.message);
    expect(messages).toEqual([
      'Cannot query field "readingStatus" on type "Book".',
      'Cannot query field "thumbnail" on type "Book".',
    ]);
  });
});
