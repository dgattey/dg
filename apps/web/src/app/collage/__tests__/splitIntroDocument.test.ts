import type { RenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import { splitIntroDocument } from '../splitIntroDocument';

const links: RenderableRichTextContent['links'] = {
  assets: { block: [] },
  entries: { block: [], inline: [] },
};

function text(value: string) {
  return { data: {}, marks: [], nodeType: 'text', value };
}

function node(nodeType: string, value: string) {
  return { content: [text(value)], data: {}, nodeType };
}

function richText(content: Array<unknown>): RenderableRichTextContent {
  return { json: { content, data: {}, nodeType: 'document' }, links };
}

describe('splitIntroDocument', () => {
  it('extracts the first plain-text heading and preserves every other node and link', () => {
    const before = node('paragraph', 'Before');
    const heading = {
      content: [text('Hey '), text('friends!')],
      data: {},
      nodeType: 'heading-1',
    };
    const body = node('paragraph', 'Intro copy');
    const later = node('heading-1', 'Still here');
    const input = richText([before, heading, body, later]);
    const result = splitIntroDocument(input);
    expect(result.headline).toBe('Hey friends!');
    expect(result.remainder.json).toEqual({
      content: [before, body, later],
      data: {},
      nodeType: 'document',
    });
    expect(result.remainder.links).toBe(links);
  });

  it('returns the untouched document when no heading exists', () => {
    const input = richText([node('paragraph', 'Intro copy')]);
    const result = splitIntroDocument(input);
    expect(result.headline).toBeNull();
    expect(result.remainder).toBe(input);
  });
});
