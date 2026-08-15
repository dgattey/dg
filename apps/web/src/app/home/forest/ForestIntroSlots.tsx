import 'server-only';

import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { getIntroContent, getLinkByName } from '../../../services/contentful';
import { IntroTextCard } from '../IntroCard';
import { FOREST_ABOUT_IMAGE_PX } from './forestMaterials';

/**
 * The grid puts the portrait and the intro copy in adjacent cells. On the map
 * they get their own clearings, so each half is fetched and planted separately.
 * Both reads are cached, so asking twice costs one Contentful round trip.
 *
 * The About photo asks Next for a ~960 source. The board is only ~312px wide,
 * but a 1440 crop of that board looks blocky if the optimizer serves the grid's
 * 330px `extraLarge`. No filter, no smash. The grid `IntroImageCard` is unchanged.
 */

const forestAboutSizes = {
  extraLarge: FOREST_ABOUT_IMAGE_PX,
  extraTiny: 640,
  large: FOREST_ABOUT_IMAGE_PX,
  medium: 800,
  small: 720,
  tiny: 640,
} as const;

export async function ForestIntroImageSlot() {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return (
    <ContentCard link={linkedInLink} overlay="About" verticalSpan={1}>
      <Image
        alt={introBlock.image.title ?? 'Introduction image'}
        cover={true}
        height={FOREST_ABOUT_IMAGE_PX}
        priority={true}
        sizes={forestAboutSizes}
        url={introBlock.image.url}
        width={FOREST_ABOUT_IMAGE_PX}
      />
    </ContentCard>
  );
}

export async function ForestIntroTextSlot() {
  const introBlock = await getIntroContent();
  if (!introBlock) {
    return null;
  }
  return <IntroTextCard introBlock={introBlock} />;
}
