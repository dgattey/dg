import { getContentfulClient } from '../contentfulClient';
import { fetchFooterContent } from '../fetchFooterContent';

jest.mock('../contentfulClient', () => ({
  getContentfulClient: jest.fn(),
}));

describe('fetchFooterContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the Contentful footer description rich text directly without AST rewriting', async () => {
    const contentfulText =
      'Building from San Francisco. Always happy to connect about product, craft, and the outdoors!';
    jest.mocked(getContentfulClient).mockReturnValue({
      request: jest.fn().mockResolvedValue({
        sectionCollection: {
          items: [
            {
              blocksCollection: {
                items: [
                  {
                    content: {
                      json: {
                        content: [
                          {
                            content: [
                              {
                                data: {},
                                marks: [],
                                nodeType: 'text',
                                value: contentfulText,
                              },
                            ],
                            data: {},
                            nodeType: 'paragraph',
                          },
                        ],
                        data: {},
                        nodeType: 'document',
                      },
                      links: {
                        assets: { block: [] },
                        entries: { block: [], inline: [] },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      }),
    } as unknown as ReturnType<typeof getContentfulClient>);

    const result = await fetchFooterContent();
    expect(result.description?.json).toEqual({
      content: [
        {
          content: [
            {
              data: {},
              marks: [],
              nodeType: 'text',
              value: contentfulText,
            },
          ],
          data: {},
          nodeType: 'paragraph',
        },
      ],
      data: {},
      nodeType: 'document',
    });
  });
});
