import 'server-only';

import { getIntroContent, getLinkByName } from '../../services/contentful';
import { IntroCard } from './IntroCard';

export async function IntroCardSlot() {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return <IntroCard introBlock={introBlock} linkedInLink={linkedInLink} />;
}
