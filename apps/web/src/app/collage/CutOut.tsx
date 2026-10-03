import type { CSSProperties } from 'react';
import type { CutOutPlacement } from './cutOutPlacements';
import { cutOutSymbolId } from './cutOutShapes';
import { cx } from './paperVars';

type CutOutStyle = CSSProperties & {
  '--cut-color': string;
  '--cut-rotation': string;
  '--cut-scale-x': number;
  '--cut-size': string;
  '--cut-x': string;
  '--cut-y': string;
  '--cut-z': number;
};

export function CutOut({
  className,
  placement,
}: {
  className?: string;
  placement: CutOutPlacement;
}) {
  const style: CutOutStyle = {
    '--cut-color': `var(--${placement.color})`,
    '--cut-rotation': `${placement.rotationDeg}deg`,
    '--cut-scale-x': placement.mirrored === true ? -1 : 1,
    '--cut-size': `${placement.sizePx}px`,
    '--cut-x': `${placement.xPercent}%`,
    '--cut-y': `${placement.yPercent}%`,
    '--cut-z': placement.zIndex,
  };
  const symbolHref = `#${cutOutSymbolId(placement.shape)}`;
  const visibility =
    placement.visibility === 'all'
      ? undefined
      : placement.visibility === 'desktop'
        ? 'cutDesktopOnly'
        : 'cutDesktopOnly cutNightOnly';

  return (
    <svg
      aria-hidden="true"
      className={cx('cutOut', visibility, className)}
      data-cut-out={placement.id}
      focusable="false"
      style={style}
      viewBox="0 0 400 400"
    >
      {placement.underprint ? (
        <use
          fill={`var(--${placement.underprint.color})`}
          href={symbolHref}
          transform={`translate(${placement.underprint.offset.join(' ')})`}
        />
      ) : null}
      <use href={symbolHref} />
    </svg>
  );
}
