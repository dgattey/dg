import * as blobs from 'blobs/v2';
import styled, { css } from 'styled-components';

interface Props {
  /**
   * Used to generate the blob shape
   */
  seed: number;

  /**
   * If passed something, sets the fill on hover
   */
  hoveredFill?: React.ComponentProps<'svg'>['fill'];
}

// Size of the element in pixels - but as it's used for viewBox, the svg will always be the same size
const SIZE = 100;

/**
 * If clickable, make sure only the fill takes pointer events
 * (not transparent area behind). Fill/fill on hover can be
 * passed for the right css for it.
 */
const Path = styled.path<{
  $isClickable: boolean;
  $fill: React.ComponentProps<'svg'>['fill'];
  $hoveredFill: React.ComponentProps<'svg'>['fill'];
}>`
  stroke-width: var(--blob-border-width);
  stroke: var(--primary-focus);
  ${({ $fill }) =>
    $fill &&
    css`
      fill: ${$fill};
    `};
  ${({ $hoveredFill }) =>
    $hoveredFill &&
    css`
      :hover {
        transition: fill var(--transition);
        fill: ${$hoveredFill};
      }
    `}
  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;
      pointer-events: visibleFill;
    `}
`;

/**
 * Creates a fun random blob that's almost a circle but has some
 * randomness built in. Generates a new blob for every seed that's
 * passed. SVG is what's returned, and it must be manually sized.
 *
 * IMPORTANT: this element is NOT safe to server render, as rounding
 * of floats make the `path` values slightly different and Next warns
 * about mismatched data. To use, wrap in a `dynamic` import from
 * Next to use only on client. Helps with page weight too, since the
 * `blobs` package should be an import specific to this page.
 */
const Blob = ({
  className,
  onClick,
  seed,
  fill,
  hoveredFill,
}: Pick<React.ComponentProps<'svg'>, 'className' | 'onClick' | 'fill'> & Props) => {
  const path = blobs.svgPath({
    seed,
    extraPoints: 5,
    randomness: 2,
    size: SIZE,
  });
  return (
    <svg
      className={className}
      onClick={onClick}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path d={path} $fill={fill} $hoveredFill={hoveredFill} $isClickable={!!onClick} />
    </svg>
  );
};

export default Blob;
