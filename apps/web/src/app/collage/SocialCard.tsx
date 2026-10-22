import type { CSSProperties } from 'react';
import { MARK_PATHS, MARK_VIEW_BOX } from '../layouts/logoMark';
import { CUT_OUT_SHAPES, type CutOutShape } from './cutOutShapes';
import { PAPER_PALETTE } from './paperPalette';

export const SOCIAL_CARD_FONT = 'Familjen Grotesk';

type PaperColor = keyof typeof PAPER_PALETTE;

type SocialCardProps = {
  grainUrl: string;
  headline: string;
  name: string;
  portraitUrl: string | null;
  tagline: string;
};

/** A cut-out's box on the sheet, in sheet pixels before rotation. */
type CutOutPiece = {
  color: PaperColor;
  rotationDeg: number;
  shape: CutOutShape;
  size: number;
  underprint?: PaperColor;
  x: number;
  y: number;
};

/** Behind the portrait like the site's print; olive behind the stamp so viridian doesn't swallow it. */
const MONSTERA: CutOutPiece = {
  color: 'viridian',
  rotationDeg: -34,
  shape: 'monstera',
  size: 700,
  x: 640,
  y: -230,
};

const CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'ultramarine', rotationDeg: -12, shape: 'seaweed', size: 240, x: -118, y: 96 },
  { color: 'olive', rotationDeg: 22, shape: 'fern', size: 320, x: -96, y: 312 },
  { color: 'ultramarine', rotationDeg: 168, shape: 'coral', size: 170, x: 548, y: -52 },
  { color: 'rose', rotationDeg: -8, shape: 'seaweed2', size: 190, x: 600, y: 440 },
  {
    color: 'vermilion',
    rotationDeg: -14,
    shape: 'birdpara',
    size: 250,
    underprint: 'ultramarine',
    x: 950,
    y: 392,
  },
  { color: 'chartreuse', rotationDeg: 24, shape: 'trefoil', size: 120, x: 1074, y: 236 },
  { color: 'ochre', rotationDeg: 10, shape: 'star4', size: 46, x: 700, y: 300 },
];

/** Satori has no `inset`, so overlays spell out their box. */
const FILL: CSSProperties = {
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};
const UNDERPRINT_OFFSET = { x: 6, y: 7 };
const PIECE_SHADOW = 'drop-shadow(0 1px 0 rgba(0,0,0,0.2)) drop-shadow(0 2px 3px rgba(0,0,0,0.12))';
const LIFTED_SHADOW =
  'drop-shadow(0 2px 0 rgba(0,0,0,0.2)) drop-shadow(0 7px 10px rgba(0,0,0,0.18))';

/** The print's oval from `CutOutSymbols`, in objectBoundingBox units. */
const PORTRAIT_OVAL =
  'M0.46 0C0.76 0 1 0.19 1 0.44C1 0.72 0.775 1 0.55 1C0.231 1 0 0.803 0 0.53C0 0.201 0.175 0 0.46 0Z';
const PORTRAIT = { height: 420, mat: 14, width: 320 };

/** Satori's `clip-path: path()` takes pixels, so the unit oval is scaled to each box. */
function ovalPath(width: number, height: number) {
  let axis = 0;
  return PORTRAIT_OVAL.replace(/[\d.]+/g, (unit) => {
    const length = axis++ % 2 === 0 ? width : height;
    return String(Math.round(Number(unit) * length * 100) / 100);
  });
}

function CutOutSvg({ color, rotationDeg, shape, size, underprint, x, y }: CutOutPiece) {
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

const [, , markBoxWidth = 1, markBoxHeight = 1] = MARK_VIEW_BOX.split(' ').map(Number);
const MARK_ASPECT = markBoxWidth / markBoxHeight;

/** The `.c-logo` stamp, scaled from its 89px-wide mark. */
function Stamp({ markWidth, rotationDeg }: { markWidth: number; rotationDeg: number }) {
  const scale = markWidth / 89;
  const px = (length: number) => `${Math.round(length * scale)}px`;
  return (
    <div
      style={{
        background: PAPER_PALETTE.viridian,
        borderRadius: [14, 12, 16, 13].map(px).join(' '),
        boxShadow: `0 0 0 ${px(3)} ${PAPER_PALETTE.cream}, 0 2px 0 rgba(0,0,0,0.2), 0 7px 14px rgba(0,0,0,0.16)`,
        display: 'flex',
        padding: `${px(10)} ${px(16)}`,
        transform: `rotate(${rotationDeg}deg)`,
      }}
    >
      <svg
        aria-hidden="true"
        fill={PAPER_PALETTE.cream}
        height={Math.round(markWidth / MARK_ASPECT)}
        viewBox={MARK_VIEW_BOX}
        width={markWidth}
      >
        {MARK_PATHS.map(({ d, dx }) => (
          <path d={d} key={dx} transform={dx ? `translate(${dx} 0)` : undefined} />
        ))}
      </svg>
    </div>
  );
}

function AboutTag({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        alignItems: 'baseline',
        background: PAPER_PALETTE.ochre,
        borderRadius: '13px 15px 12px 16px',
        color: PAPER_PALETTE.ink,
        display: 'flex',
        filter: PIECE_SHADOW,
        gap: 10,
        padding: '10px 18px 12px',
        position: 'absolute',
        transform: 'rotate(-5deg)',
        ...style,
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em' }}>About</span>
      <span style={{ fontSize: 22, opacity: 0.78 }}>Dylan</span>
    </div>
  );
}

function PortraitPrint({ portraitUrl }: { portraitUrl: string }) {
  const haloWidth = PORTRAIT.width + 2 * PORTRAIT.mat;
  const haloHeight = PORTRAIT.height + 2 * PORTRAIT.mat;
  return (
    <div
      style={{
        display: 'flex',
        height: haloHeight,
        position: 'absolute',
        right: 64,
        top: 40,
        transform: 'rotate(-3deg)',
        width: haloWidth,
      }}
    >
      <svg
        aria-hidden="true"
        height={haloHeight}
        style={{ filter: LIFTED_SHADOW, left: 0, position: 'absolute', top: 0 }}
        viewBox={`0 0 ${haloWidth} ${haloHeight}`}
        width={haloWidth}
      >
        <path d={ovalPath(haloWidth, haloHeight)} fill={PAPER_PALETTE.cream} />
      </svg>
      <img
        alt=""
        height={PORTRAIT.height}
        src={portraitUrl}
        style={{
          clipPath: `path('${ovalPath(PORTRAIT.width, PORTRAIT.height)}')`,
          left: PORTRAIT.mat,
          objectFit: 'cover',
          position: 'absolute',
          top: PORTRAIT.mat,
        }}
        width={PORTRAIT.width}
      />
      <AboutTag style={{ bottom: 44, left: -36 }} />
    </div>
  );
}

function StampFeature() {
  return (
    <div style={{ display: 'flex', position: 'absolute', right: 110, top: 150 }}>
      <Stamp markWidth={250} rotationDeg={4} />
      <AboutTag style={{ bottom: -46, left: -30 }} />
    </div>
  );
}

/**
 * The homepage hello sheet as a 1200×630 social card, laid out for Satori.
 */
export function SocialCard({ grainUrl, headline, name, portraitUrl, tagline }: SocialCardProps) {
  const [firstWord = headline, ...restWords] = headline.split(' ');
  return (
    <div
      style={{
        background: PAPER_PALETTE.viridian,
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
          background: PAPER_PALETTE.paper,
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '0 56px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ ...FILL, borderRadius: 24, display: 'flex', overflow: 'hidden' }}>
          {[{ ...MONSTERA, color: portraitUrl ? MONSTERA.color : 'olive' }, ...CUT_OUTS].map(
            (piece) => (
              <CutOutSvg key={`${piece.shape}-${piece.x}-${piece.y}`} {...piece} />
            ),
          )}
        </div>
        {/* Satori lays a fragment out as its own box, which would move the absolute print. */}
        {portraitUrl ? <PortraitPrint portraitUrl={portraitUrl} /> : <StampFeature />}
        {portraitUrl ? (
          <div style={{ display: 'flex', marginBottom: 26 }}>
            <Stamp markWidth={96} rotationDeg={-4} />
          </div>
        ) : null}
        <div
          style={{
            color: PAPER_PALETTE.ink,
            display: 'flex',
            filter: PIECE_SHADOW,
            flexDirection: 'column',
            fontSize: 144,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
          }}
        >
          <span>{firstWord}</span>
          {restWords.length > 0 ? (
            <span style={{ marginLeft: '0.62em' }}>{restWords.join(' ')}</span>
          ) : null}
        </div>
        <div
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(247,241,226,0.78)',
            border: '1px solid rgba(29,26,21,0.12)',
            borderRadius: 20,
            color: PAPER_PALETTE.ink,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginTop: 26,
            padding: '16px 28px 18px 24px',
          }}
        >
          {name === headline ? null : (
            <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em' }}>{name}</span>
          )}
          <span style={{ fontSize: 32 }}>{tagline}</span>
        </div>
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
