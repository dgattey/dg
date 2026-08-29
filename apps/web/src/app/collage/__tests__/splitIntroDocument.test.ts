import type { RenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import { splitIntroDocument } from '../splitIntroDocument';

const links: RenderableRichTextContent['links'] = {
  assets: { block: [] },
  entries: { block: [], inline: [] },
};

function richText(content: Array<unknown>): RenderableRichTextContent {
  return {
    json: {
      content,
      data: {},
      nodeType: 'document',
    },
    links,
  };
}

const paragraph = {
  content: [{ data: {}, marks: [], nodeType: 'text', value: 'Intro copy' }],
  data: {},
  nodeType: 'paragraph',
};

describe('splitIntroDocument', () => {
  it('extracts the first plain-text heading and preserves every other node and link', () => {
    const beforeHeading = {
      content: [{ data: {}, marks: [], nodeType: 'text', value: 'Before' }],
      data: {},
      nodeType: 'paragraph',
    };
    const heading = {
      content: [
        { data: {}, marks: [], nodeType: 'text', value: 'Hey ' },
        { data: {}, marks: [], nodeType: 'text', value: 'friends!' },
      ],
      data: {},
      nodeType: 'heading-1',
    };
    const laterHeading = {
      content: [{ data: {}, marks: [], nodeType: 'text', value: 'Still here' }],
      data: {},
      nodeType: 'heading-1',
    };
    const input = richText([beforeHeading, heading, paragraph, laterHeading]);

    const result = splitIntroDocument(input);

    expect(result.headline).toBe('Hey friends!');
    expect(result.remainder.json).toEqual({
      content: [beforeHeading, paragraph, laterHeading],
      data: {},
      nodeType: 'document',
    });
    expect(result.remainder.links).toBe(links);
  });

  it('returns the untouched document when no heading exists', () => {
    const input = richText([paragraph]);

    const result = splitIntroDocument(input);

    expect(result.headline).toBeNull();
    expect(result.remainder).toBe(input);
    expect(result.remainder.json).toEqual(input.json);
  });

  it('leaves a formatted heading in the remainder', () => {
    const formattedHeading = {
      content: [{ data: {}, marks: [{ type: 'bold' }], nodeType: 'text', value: 'Hey friends!' }],
      data: {},
      nodeType: 'heading-1',
    };
    const input = richText([formattedHeading, paragraph]);

    const result = splitIntroDocument(input);

    expect(result.headline).toBeNull();
    expect(result.remainder).toBe(input);
  });
});
