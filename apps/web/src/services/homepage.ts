import 'server-only';

import type { IntroContent } from '@dg/services/contentful/fetchIntroContent';
import { getIntroContent } from './contentful';

const getFirstParagraph = (introBlock: IntroContent | null) =>
  introBlock?.textBlock.content?.json.content
    ?.find((item: { nodeType: string }) => item.nodeType === 'paragraph')
    ?.content?.find((item: { nodeType: string; value?: string }) => item.nodeType === 'text')
    ?.value;

export const getHomepageDescription = async () => {
  const introBlock = await getIntroContent();
  return getFirstParagraph(introBlock) ?? null;
};
