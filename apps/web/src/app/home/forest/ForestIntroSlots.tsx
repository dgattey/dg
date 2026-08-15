import 'server-only';

import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { getIntroContent, getLinkByName } from '../../../services/contentful';
import { IntroTextCard } from '../IntroCard';
import { FOREST_ABOUT_IMAGE_PX } from './forestMaterials';

/** About asks Next for a 960 source so a 1440 crop of the board stays sharp. */

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
