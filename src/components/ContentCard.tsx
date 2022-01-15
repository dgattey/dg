import { Link, Maybe } from 'api/contentful/generated/api.generated';
import styled, { css } from 'styled-components';
import { cardSizeInEm } from './AppStyle';
import ContentWrappingLink from './ContentWrappingLink';
import Stack from './Stack';

interface Props {
  /**
   * How many columns the card spans, defaults to 1
   */
  horizontalSpan?: number;

  /**
   * How many rows the card spans, defaults to 1
   */
  verticalSpan?: number;

  /**
   * Determines whether the card can be clicked on to load/do something.
   * Adds visual styling only.
   */
  isClickable?: boolean;

  /**
   * If anything is specified here, it appears in an overlay
   * that slides in on hover
   */
  overlay?: {
    /**
     * Usually just text for a title
     */
    hiddenUntilHover: React.ReactNode;

    /**
     * Usually just an icon that's always visible as an
     * indicator
     */
    alwaysVisible: React.ReactNode;
  };

  /**
   * If provided, a link to follow upon click anywhere on the
   * card
   */
  link?: Maybe<Link>;
}

interface CardProps {
  /**
   * The number of columns to span horizontally
   */
  $hSpan: number;

  /**
   * The number of columns to span vertically. Used to calculate
   * height as well, adding space for the grid gap as needed.
   */
  $vSpan: number;

  /**
   * If the card is visually clickable
   */
  $isClickable: boolean;
}

// A stack for an overlay that animates in from slightly offscreen left when hovered
const OverlayStack = styled(Stack).attrs({ $alignItems: 'center', $gap: '8px' })`
  overflow: hidden;
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
  background: var(--contrast-overlay);
  color: var(--contrast-overlay-inverse);
  padding: 0.5em 0.75em;
  border-radius: 2em;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16);

  transition: transform var(--transition);
  transform: translateX(calc(2em - 100%));
`;

// Animates left on hover, as the container animates right, so it appears to stay in place as in comes in
const HiddenElement = styled.span`
  transition: opacity var(--transition), transform var(--transition);
  opacity: 0;
  transform-origin: left;
  transform: translateX(100%);
`;

// Card component that spans an arbitrary number of rows/cols
const Card = styled.article<CardProps>`
  position: relative;
  border: var(--border-width) solid var(--secondary-focus);
  margin: inherit;
  padding: 0;
  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;
      -webkit-transform-style: preserve-3d;
      /* Not as performant as using pseudo element + opacity for shadow, but that doesn't work with overflow: hidden */
      transition: transform var(--transition), box-shadow var(--transition);
      &:hover {
        transform: scale(1.05);
        box-shadow: var(--card-hovered-box-shadow);
        ${OverlayStack} {
          transform: initial;
        }
        ${HiddenElement} {
          opacity: 1;
          transform: initial;
        }
      }
    `}

  ${({ $hSpan }) => css`
    @media (min-width: 768px) {
      width: ${cardSizeInEm($hSpan)}em;
      grid-column-start: span ${$hSpan};
    }
  `};
  ${({ $vSpan }) =>
    css`
      @media (min-width: 768px) {
        height: ${cardSizeInEm($vSpan)}em;
      }
      grid-row-start: span ${$vSpan};
    `}
`;

/**
 * Wraps content in a card for the content grid
 */
const ContentCard = ({
  horizontalSpan,
  verticalSpan,
  isClickable,
  children,
  className,
  overlay,
  link,
}: Pick<React.ComponentProps<'article'>, 'children' | 'className'> & Props) => {
  const overlayElements = overlay && (
    <OverlayStack>
      <HiddenElement>{overlay.hiddenUntilHover}</HiddenElement>
      {overlay.alwaysVisible}
    </OverlayStack>
  );
  return (
    <Card
      className={className}
      $hSpan={horizontalSpan ?? 1}
      $vSpan={verticalSpan ?? 1}
      $isClickable={isClickable ?? false}
    >
      {link ? (
        <ContentWrappingLink link={link}>
          {children}
          {overlayElements}
        </ContentWrappingLink>
      ) : (
        <>
          {children}
          {overlayElements}
        </>
      )}
    </Card>
  );
};

export default ContentCard;
