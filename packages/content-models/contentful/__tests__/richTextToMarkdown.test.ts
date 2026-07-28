import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { RenderableRichTextContent } from '../renderables/richText';
import { richTextToMarkdown } from '../richTextToMarkdown';

const emptyLinks: RenderableRichTextContent['links'] = {
  assets: { block: [] },
  entries: { block: [], inline: [] },
};

describe('richTextToMarkdown', () => {
  it('converts paragraphs, marks, and links', () => {
    const content: RenderableRichTextContent = {
      json: {
        content: [
          {
            content: [
              { marks: [{ type: MARKS.BOLD }], nodeType: 'text', value: 'Hello' },
              { marks: [], nodeType: 'text', value: ' from ' },
              {
                content: [{ marks: [], nodeType: 'text', value: 'Dylan' }],
                data: { uri: 'https://dylangattey.com' },
                nodeType: INLINES.HYPERLINK,
              },
            ],
            data: {},
            nodeType: BLOCKS.PARAGRAPH,
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: emptyLinks,
    };

    expect(richTextToMarkdown(content)).toBe('**Hello** from [Dylan](https://dylangattey.com)');
  });

  it('renders headings and lists', () => {
    const content: RenderableRichTextContent = {
      json: {
        content: [
          {
            content: [{ marks: [], nodeType: 'text', value: 'Projects' }],
            data: {},
            nodeType: BLOCKS.HEADING_2,
          },
          {
            content: [
              {
                content: [
                  {
                    content: [{ marks: [], nodeType: 'text', value: 'One' }],
                    data: {},
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                data: {},
                nodeType: BLOCKS.LIST_ITEM,
              },
            ],
            data: {},
            nodeType: BLOCKS.UL_LIST,
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: emptyLinks,
    };

    expect(richTextToMarkdown(content)).toBe('## Projects\n\n- One');
  });

  it('returns empty string for invalid documents', () => {
    expect(
      richTextToMarkdown({
        json: { not: 'a document' },
        links: emptyLinks,
      }),
    ).toBe('');
  });
});
