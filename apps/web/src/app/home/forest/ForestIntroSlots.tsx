import 'server-only';

import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import NextImage from 'next/image';
import { getIntroContent, getLinkByName } from '../../../services/contentful';
import { IntroTextCard } from '../IntroCard';

/**
 * The grid puts the portrait and the intro copy in adjacent cells. On the map
 * they get their own clearings, so each half is fetched and planted separately.
 * Both reads are cached, so asking twice costs one Contentful round trip.
 *
 * The portrait asks Next for a 720px source at quality 90 so a 312px board
 * under rotateX still looks like a print, not a mosaic. Contentful is unchanged.
 */

const SMALL_IMAGE_SIZE = '16em';

const overlaySx: SxObject = {
  visibility: { md: 'visible', xs: 'hidden' },
};

const introImageCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: SMALL_IMAGE_SIZE },
  maxWidth: { md: 'unset', xs: SMALL_IMAGE_SIZE },
  minWidth: { md: 'unset', xs: SMALL_IMAGE_SIZE },
};

const printStyle = {
  height: '100%',
  objectFit: 'cover' as const,
  objectPosition: 'center',
  width: '100%',
};

export async function ForestIntroImageSlot() {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return (
    <ContentCard
      link={linkedInLink}
      overlay="About"
      overlaySx={overlaySx}
      sx={introImageCardSx}
      verticalSpan={1}
    >
      <NextImage
        alt={introBlock.image.title ?? 'Introduction image'}
        height={720}
        priority={true}
        quality={90}
        sizes="720px"
        src={introBlock.image.url}
        style={printStyle}
        width={720}
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
