import { useState } from 'react';
import { useCurrentImageSizes } from 'ui/helpers/useCurrentImageSizes';
import { ContentCard } from 'ui/dependent/ContentCard';
import { HoverableContainer } from 'ui/core/HoverableContainer';
import { Image } from 'ui/dependent/Image';
import { useData } from 'api/useData';
import { RichText } from 'components/RichText';
import { useLinkWithName } from 'hooks/useLinkWithName';

/**
 * Width of the intro image on small screens
 */
const SMALL_IMAGE_SIZE = '16em';

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock. The width/height here is for image
 * resizing, and the actual width may be smaller.
 */
export function IntroCard() {
  const { data: introBlock } = useData('intro');
  const linkedInLink = useLinkWithName('LinkedIn');
  const [isHovered, setIsHovered] = useState(false);
  const { width, height, sizes } = useCurrentImageSizes();

  if (!introBlock?.textBlock.content) {
    return null;
  }

  return (
    <>
      <ContentCard
        link={linkedInLink}
        onMouseOut={() => {
          setIsHovered(false);
        }}
        onMouseOver={() => {
          setIsHovered(true);
        }}
        overlay="About"
        overlaySx={(theme) => ({
          [theme.breakpoints.down('md')]: {
            visibility: 'hidden',
          },
        })}
        sx={(theme) => ({
          [theme.breakpoints.down('md')]: {
            minWidth: SMALL_IMAGE_SIZE,
            maxWidth: SMALL_IMAGE_SIZE,
            maxHeight: SMALL_IMAGE_SIZE,
          },
        })}
      >
        <HoverableContainer isHovered={isHovered}>
          <Image
            alt={introBlock.image.title ?? 'Introduction image'}
            height={height}
            priority
            sizes={sizes}
            url={introBlock.image.url}
            width={width}
          />
        </HoverableContainer>
      </ContentCard>
      <ContentCard
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          borderRadius: 0,
        }}
      >
        <RichText {...introBlock.textBlock.content} />
      </ContentCard>
    </>
  );
}
