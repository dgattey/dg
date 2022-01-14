import styled, { css } from 'styled-components';
import { cardSizeInEm } from './AppStyle';

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
}: Pick<React.ComponentProps<'article'>, 'children' | 'className'> & Props) => (
  <Card
    className={className}
    $hSpan={horizontalSpan ?? 1}
    $vSpan={verticalSpan ?? 1}
    $isClickable={isClickable ?? false}
  >
    {children}
  </Card>
);

export default ContentCard;
