import {
  isRichTextDocument,
  type RenderableRichTextContent,
} from '@dg/content-models/contentful/renderables/richText';
import { isRecord } from '@dg/shared-core/types/typeguards';

const HEADING_1 = 'heading-1';

export type SplitIntroDocument = {
  headline: string | null;
  remainder: RenderableRichTextContent;
};

function readPlainText(children: ReadonlyArray<unknown>): string | null {
  const values: Array<string> = [];
  for (const child of children) {
    if (
      !isRecord(child) ||
      child.nodeType !== 'text' ||
      typeof child.value !== 'string' ||
      !Array.isArray(child.marks) ||
      child.marks.length > 0
    ) {
      return null;
    }
    values.push(child.value);
  }

  const text = values.join('');
  return text.trim().length > 0 ? text : null;
}

export function splitIntroDocument(content: RenderableRichTextContent): SplitIntroDocument {
  if (!isRichTextDocument(content.json)) {
    return { headline: null, remainder: content };
  }

  const headingIndex = content.json.content.findIndex((node) => node.nodeType === HEADING_1);
  const heading = content.json.content[headingIndex];
  if (!heading) {
    return { headline: null, remainder: content };
  }

  const headline = readPlainText(heading.content);
  if (!headline) {
    return { headline: null, remainder: content };
  }

  const remainderJson = {
    ...content.json,
    content: content.json.content.filter((_, index) => index !== headingIndex),
  };

  return {
    headline,
    remainder: {
      json: remainderJson,
      links: content.links,
    },
  };
}
