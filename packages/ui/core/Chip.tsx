import type { HTMLAttributes, ReactNode } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

export type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';
export type ChipSize = 'small' | 'medium';
export type ChipVariant = 'filled' | 'outlined';

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  color?: ChipColor;
  icon?: ReactNode;
  label: ReactNode;
  size?: ChipSize;
  sx?: SxProps;
  variant?: ChipVariant;
};

export function Chip({
  className,
  color = 'default',
  icon,
  label,
  size = 'medium',
  sx,
  variant = 'outlined',
  ...rest
}: ChipProps) {
  const paletteVar =
    color === 'default' ? 'var(--mui-palette-text-primary)' : `var(--mui-palette-${color}-main)`;
  const contrastVar =
    color === 'default'
      ? 'var(--mui-palette-background-paper)'
      : `var(--mui-palette-${color}-contrastText)`;

  const baseSx: SxObject = {
    alignItems: 'center',
    backgroundColor: variant === 'filled' ? paletteVar : 'transparent',
    border:
      variant === 'outlined'
        ? `1px solid ${color === 'default' ? 'var(--mui-palette-divider)' : paletteVar}`
        : 'none',
    borderRadius: '16px',
    boxSizing: 'border-box',
    color: variant === 'filled' ? contrastVar : paletteVar,
    display: 'inline-flex',
    fontSize: size === 'small' ? '0.7rem' : '0.9rem',
    gap: '4px',
    height: size === 'small' ? '20px' : '28px',
    justifyContent: 'center',
    paddingInline: size === 'small' ? '8px' : '12px',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <span className={joinClasses(compiled?.className, className)} {...rest}>
        {icon ? <span style={{ display: 'inline-flex' }}>{icon}</span> : null}
        <span>{label}</span>
      </span>
    </>
  );
}
