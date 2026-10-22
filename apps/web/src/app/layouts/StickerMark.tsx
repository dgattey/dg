import type { SVGProps } from 'react';
import { STICKER_MAT_WIDTH, STICKER_VIEW_BOX, type StickerInks, stickerPaths } from './logoMark';

type StickerMarkProps = Pick<SVGProps<SVGSVGElement>, 'height' | 'style' | 'width'> & {
  inks: StickerInks;
  /** Names the mark for assistive tech; `null` hides it as decoration. */
  label: string | null;
};

/** The `dg.` mark as a die-cut sticker: a paper mat that follows the glyphs, under the inked glyphs. */
export function StickerMark({ inks, label, ...svgProps }: StickerMarkProps) {
  const { glyphs, mat } = stickerPaths(inks);
  return (
    <svg
      aria-hidden={label === null}
      aria-label={label ?? undefined}
      role={label === null ? undefined : 'img'}
      viewBox={STICKER_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g
        fill={inks.mat}
        stroke={inks.mat}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STICKER_MAT_WIDTH}
      >
        {mat.map(({ d, transform }) => (
          <path d={d} key={d} transform={transform} />
        ))}
      </g>
      {glyphs.map(({ d, fill, transform }) => (
        <path d={d} fill={fill} key={d} transform={transform} />
      ))}
    </svg>
  );
}
