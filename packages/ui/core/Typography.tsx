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
    fontSize: { lg: '1.0625rem', sm: '1rem', xs: '1.03125rem' },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    ...TYPOGRAPHY.body2,
    color: 'var(--mui-palette-text-secondary)',
    fontSize: { lg: '1.0625rem', sm: '1.049rem', xs: '1.03125rem' },
    fontWeight: 400,
    lineHeight: 1.43,
  },
  button: {
    ...TYPOGRAPHY.button,
    lineHeight: 1.75,
  },
  caption: {
    ...TYPOGRAPHY.caption,
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
    fontSize: { lg: '1.2813rem', sm: '1.2146rem', xs: '1.140625rem' },
    lineHeight: 1.235,
  },
  h5: {
    ...TYPOGRAPHY.h5,
    color: 'var(--mui-palette-text-h5)',
    fontSize: { lg: '1.0313rem', sm: '0.937rem', xs: '1.015625rem' },
    lineHeight: 1.334,
  },
  h6: {
    ...TYPOGRAPHY.h6,
    color: 'var(--mui-palette-text-h6)',
    lineHeight: 1.6,
  },
  overline: {
    ...TYPOGRAPHY.overline,
    lineHeight: 1.25,
  },
};

function resolveTypographyColor(color: string): string | undefined {
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
    case 'textPrimary':
      return 'var(--mui-palette-text-primary)';
    case 'textSecondary':
      return 'var(--mui-palette-text-secondary)';
    case 'inherit':
      return 'inherit';
    default:
      return undefined;
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
  const resolvedColor = color ? resolveTypographyColor(color) : undefined;
  const baseSx: SxObject = {
    fontFamily: 'var(--font-sans)',
    margin: 0,
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'auto',
    ...VARIANT_STYLES[variant],
    ...(resolvedColor ? { color: resolvedColor } : {}),
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
