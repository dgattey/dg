import type { CSSProperties, ReactNode } from 'react';
import { type ScallopSize, scallopVertices } from '../music/stats/StatsShapes';
import { PAPER_PALETTE } from './paperPalette';
import { inkForTone, type PaperColor, PIECE_SHADOW } from './SocialCardParts';

function scallopSvgPath(size: ScallopSize): string {
  const points = scallopVertices(size, 100, 98, 8).map(
    ({ x, y }, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`,
  );
  return `${points.join(' ')} Z`;
}

const SCALLOP_PATHS: Record<ScallopSize, string> = {
  seal: scallopSvgPath('seal'),
  sticker: scallopSvgPath('sticker'),
};

export function SocialCardScallop({
  children,
  kind = 'seal',
  size = 136,
  style,
  tiltDeg = -6,
  tone,
}: {
  children: ReactNode;
  kind?: ScallopSize;
  size?: number;
  style?: CSSProperties;
  tiltDeg?: number;
  tone: PaperColor;
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        color: inkForTone(tone),
        display: 'flex',
        flexDirection: 'column',
        height: size,
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        textAlign: 'center',
        transform: `rotate(${tiltDeg}deg)`,
        width: size,
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        height={size}
        style={{ filter: PIECE_SHADOW, left: 0, position: 'absolute', top: 0 }}
        viewBox="0 0 200 200"
        width={size}
      >
        <path d={SCALLOP_PATHS[kind]} fill={PAPER_PALETTE[tone]} />
      </svg>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}
