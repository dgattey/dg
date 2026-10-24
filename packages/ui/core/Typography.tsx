import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';

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

const PALETTE_COLOR_TOKENS: Record<string, string> = {
  'text.primary': 'var(--dg-palette-text-primary)',
  'text.secondary': 'var(--dg-palette-text-secondary)',
};

type TypographyProps<T extends ElementType = 'p'> = {
  children?: ReactNode;
  className?: string;
  color?: string;
  component?: T;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  variant?: TypographyVariant;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'color' | 'style'> &
  Omit<
    ComponentPropsWithRef<T>,
    'children' | 'className' | 'color' | 'component' | 'style' | 'variant'
  >;

export function Typography<T extends ElementType = 'p'>({
  children,
  className,
  color,
  component,
  ref,
  style,
  variant = 'body1',
  ...rest
}: TypographyProps<T>) {
  const Component = (component ?? DEFAULT_ELEMENT[variant]) as ElementType;
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
