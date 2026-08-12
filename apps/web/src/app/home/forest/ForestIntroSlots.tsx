import 'server-only';

import { getIntroContent, getLinkByName } from '../../../services/contentful';
import { IntroImageCard, IntroTextCard } from '../IntroCard';

/**
 * The grid puts the portrait and the intro copy in adjacent cells. On the map
 * they get their own clearings, so each half is fetched and planted separately.
 * Both reads are cached, so asking twice costs one Contentful round trip.
 */

export async function ForestIntroImageSlot() {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return <IntroImageCard introBlock={introBlock} linkedInLink={linkedInLink} />;
}

export async function ForestIntroTextSlot() {
  const introBlock = await getIntroContent();
  if (!introBlock) {
    return null;
  }
  return <IntroTextCard introBlock={introBlock} />;
}
