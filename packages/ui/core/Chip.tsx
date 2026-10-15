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

export type ChipProps = HTMLAttributes<HTMLDivElement> & {
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
  const isSmall = size === 'small';
  const labelPadding =
    variant === 'outlined' ? (isSmall ? '7px' : '11px') : isSmall ? '8px' : '12px';

  const baseSx: SxObject = {
    alignItems: 'center',
    backgroundColor: variant === 'filled' ? paletteVar : 'transparent',
    border: variant === 'outlined' && color === 'default' ? '1px solid #bdbdbd' : 0,
    borderRadius: '16px',
    boxSizing: 'border-box',
    color: variant === 'filled' ? contrastVar : paletteVar,
    cursor: 'unset',
    display: 'inline-flex',
    fontFamily: 'var(--font-sans)',
    fontSize: isSmall ? '0.7rem' : '0.9rem',
    height: isSmall ? '20px' : '28px',
    justifyContent: 'center',
    lineHeight: 1.5,
    maxWidth: '100%',
    outline: 0,
    padding: 0,
    textDecoration: 'none',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <div className={joinClasses(compiled?.className, className)} {...rest}>
        {icon ? (
          <span
            style={{
              display: 'inline-flex',
              marginLeft:
                variant === 'outlined' ? (isSmall ? '2px' : '4px') : isSmall ? '4px' : '5px',
              marginRight: isSmall ? '-4px' : '-6px',
            }}
          >
            {icon}
          </span>
        ) : null}
        <span
          style={{
            overflow: 'hidden',
            paddingInline: labelPadding,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
}
