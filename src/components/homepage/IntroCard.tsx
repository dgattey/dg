import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import HoverableContainer from 'components/HoverableContainer';
import Image from 'components/Image';
import RichText from 'components/RichText';
import useLinkWithName from 'hooks/useLinkWithName';
import { useState } from 'react';
import styled from 'styled-components';

const ImageCard = styled(ContentCard)`
  @media (max-width: 767.96px) {
    --size: 12em;
    justify-self: center;
    width: var(--size);
    height: var(--size);
    display: flex;
    border-radius: calc(var(--size) / 2);
  }
`;

const TextCard = styled(ContentCard)`
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
`;

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock.
 */
const IntroCard = () => {
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
          <Image {...introBlock.image} alt={introBlock.image.title} layout="intrinsic" />
        </HoverableContainer>
      </ImageCard>
      <TextCard>
        <RichText {...introBlock.textBlock.content} />
      </TextCard>
    </>
  );
};

export default IntroCard;
