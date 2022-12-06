import { useData } from 'api/useData';
import { ContentCard } from 'components/ContentCard';
import { HoverableContainer } from 'components/HoverableContainer';
import { Image } from 'components/Image';
import { RichText } from 'components/RichText';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { useState } from 'react';
import styled from '@emotion/styled';
import { PROJECT_IMAGE_SIZES, PROJECT_MAX_IMAGE_DIMENSION } from 'constants/imageSizes';

const ImageCard = styled(ContentCard)`
  @media (max-width: 767.96px) {
    --size: 14em;
    justify-self: center;
    width: var(--size);
    height: var(--size);
    border-radius: calc(var(--size) / 2);

    & article {
      visibility: hidden;
    }
  }
`;

const TextCard = styled(ContentCard)`
  && {
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    box-shadow: none;
    & h1 {
      --typography-spacing-vertical: 1rem;
    }
  }
`;

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

  if (!introBlock?.textBlock?.content) {
    return null;
  }

  return (
    <>
      <ImageCard
        link={linkedInLink}
        overlay="About"
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <HoverableContainer isHovered={isHovered}>
          <Image
            url={introBlock.image.url}
            width={PROJECT_MAX_IMAGE_DIMENSION}
            height={PROJECT_MAX_IMAGE_DIMENSION}
            alt={introBlock.image.title ?? 'Introduction image'}
            priority
            sizes={PROJECT_IMAGE_SIZES}
          />
        </HoverableContainer>
      </ImageCard>
      <TextCard>
        <RichText {...introBlock.textBlock.content} />
      </TextCard>
    </>
  );
}
