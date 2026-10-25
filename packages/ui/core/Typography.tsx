import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import type { TypographyRole } from '../theme/typography';

export type TypographyVariant = TypographyRole;

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  badge: 'span',
  caption: 'span',
  code: 'span',
  'display-cut': 'h1',
  'display-hero': 'h1',
  'display-page': 'h1',
  label: 'span',
  meta: 'span',
  prose: 'p',
  'prose-lg': 'p',
  'row-title': 'span',
  stamp: 'span',
  'stat-lg': 'span',
  'stat-md': 'span',
  'stat-xl': 'span',
  'title-md': 'h2',
  'title-sm': 'h3',
};

const PALETTE_COLOR_TOKENS: Record<string, string> = {
  'text.primary': 'var(--dg-palette-text-primary)',
  'text.secondary': 'var(--dg-palette-text-secondary)',
};

type TypographyProps<T extends ElementType = 'p'> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  color?: string;
  component?: T;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  variant?: TypographyVariant;
} & Omit<HTMLAttributes<HTMLElement>, 'as' | 'children' | 'className' | 'color' | 'style'> &
  Omit<
    ComponentPropsWithRef<T>,
    'as' | 'children' | 'className' | 'color' | 'component' | 'style' | 'variant'
  >;

export function Typography<T extends ElementType = 'p'>({
  as,
  children,
  className,
  color,
  component,
  ref,
  style,
  variant = 'prose',
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? component ?? DEFAULT_ELEMENT[variant]) as ElementType;
  const resolvedColor = color ? (PALETTE_COLOR_TOKENS[color] ?? color) : undefined;
  const mergedStyle = resolvedColor
    ? ({ '--typography-color': resolvedColor, ...style } as CSSProperties)
    : style;

  return (
    <Component
      className={className}
      data-has-color={resolvedColor ? '' : undefined}
      data-typography={variant}
      ref={ref}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
