import type { CSSProperties } from 'react';
import styles from './cutOut.module.css';
import type { CutOutPlacement } from './cutOutPlacements';
import { cutOutSymbolId } from './cutOutShapes';

type CutOutStyle = CSSProperties & {
  '--cut-color': string;
  '--cut-rotation': string;
  '--cut-scale-x': number;
  '--cut-size': string;
  '--cut-x': string;
  '--cut-y': string;
  '--cut-z': number;
};

type CutOutProps = {
  className?: string;
  placement: CutOutPlacement;
};

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined).join(' ');
}

function visibilityClass(visibility: CutOutPlacement['visibility']): string | undefined {
  if (visibility === 'all') {
    return undefined;
  }
  if (visibility === 'desktop') {
    return styles.desktopOnly;
  }
  return classNames(styles.desktopOnly, styles.nightOnly);
}

export function CutOut({ className, placement }: CutOutProps) {
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

  return (
    <svg
      aria-hidden="true"
      className={classNames(styles.cutOut, visibilityClass(placement.visibility), className)}
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
