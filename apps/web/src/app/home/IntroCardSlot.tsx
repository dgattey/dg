import 'server-only';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getIntroContent, getLinkByName } from '../../services/contentful';
import { IntroCard } from './IntroCard';

export async function IntroCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return <IntroCard introBlock={introBlock} linkedInLink={linkedInLink} surface={surface} />;
}
