import 'server-only';

import { findLinkWithName } from '@dg/services/contentful/parsers';
import { getFooterLinks, getIntroContent } from '../../services/contentful';
import { IntroCard } from './IntroCard';

export async function IntroCardSlot() {
  const [introBlock, footerLinks] = await Promise.all([getIntroContent(), getFooterLinks()]);
  const linkedInLink = findLinkWithName(footerLinks, 'LinkedIn');
  if (!introBlock) {
    return null;
  }
  return <IntroCard introBlock={introBlock} linkedInLink={linkedInLink} />;
}
