import useData from 'api/useData';
import ContentCard, { OverlayStack } from 'components/ContentCard';
import Image from 'components/Image';
import RichText from 'components/RichText';
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
  display: flex;
  flex-direction: column;
  align-items: center;
  & h1 {
    --typography-spacing-vertical: 1.5rem;
  }
  & p {
    font-size: 0.9em;
  }
  background: none;
  border: none;
  box-shadow: none;
`;

/**
 * Creates an intro information card for use on the homepage. Technically
 * creates two cards in a fragment. Also adds meta for the whole Homepage,
 * as the data comes from the introBlock.
 */
const IntroCard = () => {
  const { data: introBlock } = useData('introBlock');
  const { data: footerLinks } = useData('siteFooter');

  if (!introBlock?.textBlock?.content) {
    return null;
  }

  return (
    <>
      <ImageCard
        link={footerLinks?.find((item) => item.title?.includes('LinkedIn'))}
        overlay={{
          alwaysVisible: <FiUser />,
          hiddenUntilHover: <strong>About</strong>,
        }}
      >
        <Image {...introBlock.image} alt={introBlock.image.title} layout="intrinsic" />
      </ImageCard>
      <TextCard>
        <RichText {...introBlock.textBlock.content} />
      </TextCard>
    </>
  );
};

export default IntroCard;
