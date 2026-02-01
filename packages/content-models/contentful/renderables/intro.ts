import type { RenderableAsset } from './assets';
import type { RenderableRichTextContent } from './richText';

export type IntroContent = {
  textBlock: {
    content: RenderableRichTextContent;
  };
  image: RenderableAsset;
};
