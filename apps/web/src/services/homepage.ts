import 'server-only';

import { isRichTextDocument } from '@dg/content-models/contentful/renderables/richText';
import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { getIntroContent } from './contentful';

const getFirstParagraph = (introBlock: IntroContent | null) => {
  const json = introBlock?.textBlock.content?.json;
  if (!isRichTextDocument(json)) {
    return undefined;
  }
  return json.content
    ?.find((item) => item?.nodeType === 'paragraph')
    ?.content?.find((item) => item?.nodeType === 'text')?.value;
};

export const getHomepageDescription = async () => {
  const introBlock = await getIntroContent();
  return getFirstParagraph(introBlock) ?? null;
};
