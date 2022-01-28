import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import ContentCard, { OverlayStack } from 'components/ContentCard';
import HoverableContainer from 'components/HoverableContainer';
import Image from 'components/Image';
import RichText from 'components/RichText';
import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import styled from 'styled-components';

const ImageCard = styled(ContentCard)`
  @media (max-width: 767.96px) {
    --size: 12em;
    justify-self: center;
    width: var(--size);
    height: var(--size);
    display: flex;
    border-radius: calc(var(--size) / 2);
    ${OverlayStack} {
      opacity: 0;
    }
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
  const { data: footerLinks } = useData('footer');
  const [isHovered, setIsHovered] = useState(false);

  if (!introBlock?.textBlock?.content) {
    return null;
  }

  return (
    <>
      <ImageCard
        link={findLinkWithName(footerLinks, 'LinkedIn')}
        overlay={{
          alwaysVisible: <FiUser />,
          hiddenUntilHover: <strong>About</strong>,
        }}
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