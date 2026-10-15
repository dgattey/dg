import type { HTMLAttributes } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

export type CircularProgressProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number | string;
  sx?: SxProps;
};

export function CircularProgress({ className, size = 40, sx, ...rest }: CircularProgressProps) {
  const dim = typeof size === 'number' ? `${size}px` : size;
  const baseSx: SxObject = {
    animation: 'dg-spin 1.4s linear infinite',
    color: 'var(--mui-palette-primary-main)',
    display: 'inline-block',
    height: dim,
    width: dim,
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <span className={joinClasses(compiled?.className, className)} role="progressbar" {...rest}>
        <svg aria-hidden="true" style={{ display: 'block' }} viewBox="22 22 44 44">
          <circle
            cx="44"
            cy="44"
            fill="none"
            r="20.2"
            stroke="currentColor"
            strokeDasharray="80px, 200px"
            strokeDashoffset="0"
            strokeWidth="3.6"
          />
        </svg>
      </span>
    </>
  );
}
