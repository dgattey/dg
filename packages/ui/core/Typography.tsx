import type { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';
import { getTypography } from '../theme/typography';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button'
  | 'code';

const TYPOGRAPHY = getTypography();

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  body1: 'p',
  body2: 'p',
  button: 'span',
  caption: 'span',
  code: 'span',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  overline: 'span',
};

const VARIANT_STYLES: Record<TypographyVariant, SxObject> = {
  body1: {
    ...TYPOGRAPHY.body1,
    color: 'var(--mui-palette-text-primary)',
    lineHeight: 1.5,
  },
  body2: {
    ...TYPOGRAPHY.body2,
    color: 'var(--mui-palette-text-secondary)',
    lineHeight: 1.43,
  },
  button: {
    ...TYPOGRAPHY.button,
    color: 'var(--mui-palette-text-primary)',
    lineHeight: 1.75,
  },
  caption: {
    ...TYPOGRAPHY.caption,
    color: 'var(--mui-palette-text-primary)',
    lineHeight: 1.66,
  },
  code: {
    ...TYPOGRAPHY.code,
    background: 'var(--mui-palette-background-paper)',
    color: 'var(--mui-palette-text-secondary)',
  },
  h1: {
    ...TYPOGRAPHY.h1,
    color: 'var(--mui-palette-text-h1)',
    lineHeight: 1.167,
  },
  h2: {
    ...TYPOGRAPHY.h2,
    color: 'var(--mui-palette-text-h2)',
    lineHeight: 1.2,
  },
  h3: {
    ...TYPOGRAPHY.h3,
    color: 'var(--mui-palette-text-h3)',
    lineHeight: 1.167,
  },
  h4: {
    ...TYPOGRAPHY.h4,
    color: 'var(--mui-palette-text-h4)',
    lineHeight: 1.235,
  },
  h5: {
    ...TYPOGRAPHY.h5,
    color: 'var(--mui-palette-text-h5)',
    lineHeight: 1.334,
  },
  h6: {
    ...TYPOGRAPHY.h6,
    color: 'var(--mui-palette-text-h6)',
    lineHeight: 1.6,
  },
  overline: {
    ...TYPOGRAPHY.overline,
    color: 'var(--mui-palette-text-primary)',
    lineHeight: 2.66,
    textTransform: 'uppercase',
  },
};

function resolveTypographyColor(color: string): string {
  switch (color) {
    case 'error':
      return 'var(--mui-palette-error-main)';
    case 'primary':
      return 'var(--mui-palette-primary-main)';
    case 'secondary':
      return 'var(--mui-palette-secondary-main)';
    case 'warning':
      return 'var(--mui-palette-warning-main)';
    case 'info':
      return 'var(--mui-palette-info-main)';
    case 'success':
      return 'var(--mui-palette-success-main)';
    default:
      return color;
  }
}

export type TypographyProps<T extends ElementType = 'p'> = {
  children?: ReactNode;
  className?: string;
  color?: string;
  component?: T;
  fontWeight?: number | string;
  gutterBottom?: boolean;
  noWrap?: boolean;
  ref?: Ref<HTMLElement>;
  sx?: SxProps;
  variant?: TypographyVariant;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'color'> &
  Omit<
    ComponentPropsWithRef<T>,
    | 'children'
    | 'className'
    | 'color'
    | 'component'
    | 'fontWeight'
    | 'gutterBottom'
    | 'noWrap'
    | 'sx'
    | 'variant'
  >;

export function Typography<T extends ElementType = 'p'>({
  children,
  className,
  color,
  component,
  fontWeight,
  gutterBottom,
  noWrap,
  ref,
  sx,
  variant = 'body1',
  ...rest
}: TypographyProps<T>) {
  const Component = (component ?? DEFAULT_ELEMENT[variant]) as ElementType;
  const baseSx: SxObject = {
    margin: 0,
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'auto',
    ...VARIANT_STYLES[variant],
    ...(color ? { color: resolveTypographyColor(color) } : {}),
    ...(fontWeight !== undefined ? { fontWeight } : {}),
    ...(gutterBottom ? { marginBottom: '0.35em' } : {}),
    ...(noWrap
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : {}),
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <Component
        className={joinClasses(compiled?.className, className)}
        data-typography=""
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    </>
  );
}
