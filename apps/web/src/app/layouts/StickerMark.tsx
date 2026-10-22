import type { SVGProps } from 'react';
import {
  STICKER_MAT_WIDTH,
  STICKER_SHADOW_VIEW_BOX,
  STICKER_VIEW_BOX,
  type StickerInks,
  stickerPaths,
} from './logoMark';

const SHADOW_ID = 'sticker-shadow';

type StickerMarkProps = Pick<SVGProps<SVGSVGElement>, 'height' | 'style' | 'width'> & {
  inks: StickerInks;
  /** Names the mark for assistive tech; `null` hides it as decoration. */
  label: string | null;
  /**
   * Paints the lifted paper shadow inside the SVG, which grows the view box by
   * `STICKER_SHADOW_PAD` on every side. The id is fixed, so one per document.
   */
  shadow?: boolean;
};

/** The `dg.` mark as a die-cut sticker: a paper mat that follows the glyphs, under the inked glyphs. */
export function StickerMark({ inks, label, shadow = false, ...svgProps }: StickerMarkProps) {
  const { glyphs, mat } = stickerPaths(inks);
  const layers = [
    <g
      fill={inks.mat}
      key="mat"
      stroke={inks.mat}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STICKER_MAT_WIDTH}
    >
      {mat.map(({ d, transform }) => (
        <path d={d} key={d} transform={transform} />
      ))}
    </g>,
    ...glyphs.map(({ d, fill, transform }) => (
      <path d={d} fill={fill} key={d} transform={transform} />
    )),
  ];
  return (
    <svg
      aria-hidden={label === null}
      aria-label={label ?? undefined}
      role={label === null ? undefined : 'img'}
      viewBox={shadow ? STICKER_SHADOW_VIEW_BOX : STICKER_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {shadow ? (
        <defs>
          <filter height="200%" id={SHADOW_ID} width="200%" x="-50%" y="-50%">
            <feDropShadow dx="0" dy="8" floodColor="#000" floodOpacity="0.2" stdDeviation="0" />
            <feDropShadow dx="0" dy="28" floodColor="#000" floodOpacity="0.18" stdDeviation="20" />
          </filter>
        </defs>
      ) : null}
      {shadow ? <g filter={`url(#${SHADOW_ID})`}>{layers}</g> : layers}
    </svg>
  );
}
