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

  return (
    <Component
      className={className}
      data-typography={variant}
      ref={ref}
      style={color ? { color, ...style } : style}
      {...rest}
    >
      {children}
    </Component>
  );
}
