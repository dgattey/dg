import type { CSSProperties, ReactNode } from 'react';
import { PAPER_PALETTE } from './paperPalette';
import { inkForTone, type PaperColor, PIECE_SHADOW } from './SocialCardParts';

function scallopSvgPath(bumps: number, depth: number): string {
  const samples = bumps * 8;
  return `${Array.from({ length: samples }, (_, i) => {
    const angle = (i / samples) * Math.PI * 2;
    const radius = 98 - depth + depth * Math.sqrt(Math.abs(Math.sin((bumps * angle) / 2)));
    return `${i === 0 ? 'M' : 'L'}${(100 + radius * Math.cos(angle)).toFixed(1)} ${(100 + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ')} Z`;
}

const SCALLOP_PATHS = {
  seal: scallopSvgPath(18, 6.4),
  sticker: scallopSvgPath(12, 9.5),
} as const;

export function SocialCardScallop({
  children,
  kind = 'seal',
  size = 136,
  style,
  tiltDeg = -6,
  tone,
}: {
  children: ReactNode;
  kind?: keyof typeof SCALLOP_PATHS;
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
