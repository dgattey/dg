import 'server-only';

import { getFooterLinks, getIntroContent, getLinkByName } from '../../services/contentful';
import { IntroCard, type IntroCardVariant } from './IntroCard';

const SOCIAL_ORDER = ['github', 'linkedin', 'email'] as const;

export async function IntroCardSlot({ variant = 'split' }: { variant?: IntroCardVariant } = {}) {
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
