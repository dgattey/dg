import 'server-only';

import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { getFooterLinks, getIntroContent, getLinkByName } from '../../services/contentful';
import { IntroCard, type IntroCardVariant } from './IntroCard';

const SOCIAL_ORDER = ['github', 'linkedin', 'email'] as const;

export type IntroCardFixture = {
  introBlock: IntroContent;
  linkedInLink?: RenderableLink | null;
  socialLinks?: Array<RenderableLink>;
};

export async function IntroCardSlot({
  fixture,
  variant = 'split',
}: {
  fixture?: IntroCardFixture;
  variant?: IntroCardVariant;
} = {}) {
  if (fixture) {
    return (
      <IntroCard
        introBlock={fixture.introBlock}
        linkedInLink={fixture.linkedInLink ?? null}
        socialLinks={fixture.socialLinks ?? []}
        variant={variant}
      />
    );
  }

  try {
    const [introBlock, linkedInLink, footerLinks] = await Promise.all([
      getIntroContent(),
      getLinkByName('LinkedIn'),
      variant === 'composed' ? getFooterLinks() : Promise.resolve([]),
    ]);
    if (!introBlock) {
      return null;
    }
    const socialLinks = SOCIAL_ORDER.map((icon) =>
      footerLinks.find((link) => link.icon === icon),
    ).filter((link) => link != null);
    return (
      <IntroCard
        introBlock={introBlock}
        linkedInLink={linkedInLink}
        socialLinks={socialLinks}
        variant={variant}
      />
    );
  } catch {
    return null;
  }
}
