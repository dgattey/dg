import type { CSSProperties, ReactNode } from 'react';
import {
  STICKER_ASPECT,
  STICKER_PALETTE_INKS,
  STICKER_SHADOW_PAD,
  STICKER_WIDTH,
} from '../layouts/logoMark';
import { StickerMark } from '../layouts/StickerMark';
import { CUT_OUT_SHAPES, type CutOutShape } from './cutOutShapes';
import { PAPER_PALETTE } from './paperPalette';

export const SOCIAL_CARD_FONT = 'Familjen Grotesk';

export type PaperColor = keyof typeof PAPER_PALETTE;

export type CutOutPiece = {
  color: PaperColor;
  rotationDeg: number;
  shape: CutOutShape;
  size: number;
  underprint?: PaperColor;
  x: number;
  y: number;
};

export const FILL: CSSProperties = {
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};

const UNDERPRINT_OFFSET = { x: 6, y: 7 };
export const QUAD_A = '14px 12px 16px 13px';
export const QUAD_C = '13px 15px 12px 16px';
export const PAPER_SHADOW = '0 1px 0 rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.12)';
export const MAT_OFFSET = 12;
export const PIECE_SHADOW =
  'drop-shadow(0 1px 0 rgba(0,0,0,0.2)) drop-shadow(0 2px 3px rgba(0,0,0,0.12))';
export const LIFTED_SHADOW =
  'drop-shadow(0 2px 0 rgba(0,0,0,0.2)) drop-shadow(0 7px 10px rgba(0,0,0,0.18))';

const DARK_TONES: ReadonlySet<PaperColor> = new Set([
  'black',
  'cobalt',
  'ink',
  'leaf',
  'ultramarine',
  'vermilion',
  'viridian',
]);

export function inkForTone(tone: PaperColor): string {
  return DARK_TONES.has(tone) ? PAPER_PALETTE.cream : PAPER_PALETTE.ink;
}

export function CutOutSvg({ color, rotationDeg, shape, size, underprint, x, y }: CutOutPiece) {
  const transform = `rotate(${rotationDeg}deg)`;
  return (
    <div
      style={{ display: 'flex', height: size, left: x, position: 'absolute', top: y, width: size }}
    >
      {underprint ? (
        <svg
          aria-hidden="true"
          height={size}
          style={{
            left: UNDERPRINT_OFFSET.x,
            position: 'absolute',
            top: UNDERPRINT_OFFSET.y,
            transform,
          }}
          viewBox="0 0 400 400"
          width={size}
        >
          <path d={CUT_OUT_SHAPES[shape]} fill={PAPER_PALETTE[underprint]} />
        </svg>
      ) : null}
      <svg
        aria-hidden="true"
        height={size}
        style={{ filter: PIECE_SHADOW, left: 0, position: 'absolute', top: 0, transform }}
        viewBox="0 0 400 400"
        width={size}
      >
        <path d={CUT_OUT_SHAPES[shape]} fill={PAPER_PALETTE[color]} />
      </svg>
    </div>
  );
}

export function SocialCardStamp({ rotationDeg, width }: { rotationDeg: number; width: number }) {
  const pad = (STICKER_SHADOW_PAD * width) / STICKER_WIDTH;
  return (
    <StickerMark
      height={Math.round(width / STICKER_ASPECT + 2 * pad)}
      inks={STICKER_PALETTE_INKS}
      label={null}
      shadow
      style={{ margin: -pad, transform: `rotate(${rotationDeg}deg)` }}
      width={Math.round(width + 2 * pad)}
    />
  );
}

export function SocialCardHeadline({
  color = PAPER_PALETTE.ink,
  fontSize = 104,
  headline,
  indentEm = 0.44,
}: {
  color?: string;
  fontSize?: number;
  headline: string;
  indentEm?: number;
}) {
  const [firstWord = headline, ...restWords] = headline.split(' ');
  return (
    <div
      style={{
        color,
        display: 'flex',
        filter: PIECE_SHADOW,
        flexDirection: 'column',
        fontSize,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 0.9,
      }}
    >
      <span>{firstWord}</span>
      {restWords.length > 0 ? (
        <span style={{ marginLeft: `${indentEm}em` }}>{restWords.join(' ')}</span>
      ) : null}
    </div>
  );
}

export function SocialCardTag({
  children,
  style,
  tiltDeg = -3,
  tone = 'ochre',
}: {
  children: ReactNode;
  style?: CSSProperties;
  tiltDeg?: number;
  tone?: PaperColor;
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: PAPER_PALETTE[tone],
        borderRadius: QUAD_C,
        boxShadow: PAPER_SHADOW,
        color: inkForTone(tone),
        display: 'flex',
        fontSize: 21,
        fontWeight: 700,
        gap: 8,
        letterSpacing: '-0.01em',
        padding: '8px 16px 10px',
        transform: `rotate(${tiltDeg}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SocialCardMattedCard({
  cardTone = 'cream',
  children,
  matOffset = MAT_OFFSET,
  matTiltDeg = 2,
  matTone = 'ochre',
  padding = '18px 28px 20px 24px',
  style,
  tiltDeg = -1.5,
}: {
  cardTone?: PaperColor;
  children: ReactNode;
  matOffset?: number;
  matTiltDeg?: number;
  matTone?: PaperColor;
  padding?: string;
  style?: CSSProperties;
  tiltDeg?: number;
}) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'flex',
        position: 'relative',
        transform: `rotate(${tiltDeg}deg)`,
        ...style,
      }}
    >
      <div
        style={{
          ...FILL,
          background: PAPER_PALETTE[matTone],
          borderRadius: QUAD_C,
          boxShadow: PAPER_SHADOW,
          display: 'flex',
          transform: `translate(${matOffset}px, ${matOffset}px) rotate(${matTiltDeg}deg)`,
        }}
      />
      <div
        style={{
          background: PAPER_PALETTE[cardTone],
          borderRadius: QUAD_A,
          boxShadow: PAPER_SHADOW,
          color: inkForTone(cardTone),
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding,
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SocialCardFrame({
  borderTone,
  children,
  cutOuts,
  grainUrl,
  sheetTone = 'paper',
}: {
  borderTone: PaperColor;
  children: ReactNode;
  cutOuts: ReadonlyArray<CutOutPiece>;
  grainUrl: string;
  sheetTone?: PaperColor;
}) {
  return (
    <div
      style={{
        background: PAPER_PALETTE[borderTone],
        display: 'flex',
        fontFamily: SOCIAL_CARD_FONT,
        height: '100%',
        padding: 18,
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          background: PAPER_PALETTE[sheetTone],
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '0 52px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ ...FILL, borderRadius: 24, display: 'flex', overflow: 'hidden' }}>
          {cutOuts.map((piece) => (
            <CutOutSvg key={`${piece.shape}-${piece.x}-${piece.y}`} {...piece} />
          ))}
        </div>
        {children}
      </div>
      <div
        style={{
          ...FILL,
          backgroundImage: `url(${grainUrl})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          display: 'flex',
        }}
      />
    </div>
  );
}
