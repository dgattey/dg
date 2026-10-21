import type { RenderableLink } from './links';
import type { RenderableRichTextContent } from './richText';

export type FooterContent = {
  description: RenderableRichTextContent | null;
  links: Array<RenderableLink>;
};
