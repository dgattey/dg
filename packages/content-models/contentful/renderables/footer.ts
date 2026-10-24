import type { RenderableLink } from './links';
import type { RenderableRichTextContent } from './richText';

export type FooterSectionKey = 'elsewhere' | 'hello';

export type FooterContent = {
  description: RenderableRichTextContent | null;
  elsewhereTitle?: string | null;
  helloTitle?: string | null;
  links: Array<RenderableLink>;
  sectionOrder?: ReadonlyArray<FooterSectionKey>;
};

export type HeaderNavMenu = {
  kind: 'menu';
  links: Array<RenderableLink>;
  slug: string | null;
  title: string;
};

export type HeaderNavLink = {
  kind: 'link';
  link: RenderableLink;
};

export type HeaderNavItem = HeaderNavLink | HeaderNavMenu;

export type HeaderContent = {
  items: Array<HeaderNavItem>;
};
