import type { ComponentPropsWithRef, ElementType, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'contained' | 'outlined' | 'text';

const SIZE_STYLES: Record<ButtonSize, SxObject> = {
  large: {
    fontSize: '0.8125rem',
    padding: '8px 20px',
  },
  medium: {
    fontSize: '0.75rem',
    padding: '6px 16px',
  },
  small: {
    fontSize: '0.6875rem',
    padding: '4px 12px',
  },
};

function getVariantStyles(variant: ButtonVariant, color: ButtonColor): SxObject {
  const main = `var(--mui-palette-${color}-main)`;
  const dark = `var(--mui-palette-${color}-dark)`;
  const contrast = `var(--mui-palette-${color}-contrastText)`;

  switch (variant) {
    case 'contained':
      return {
        '&:hover': {
          backgroundColor: dark,
        },
        backgroundColor: main,
        border: 'none',
        color: contrast,
      };
    case 'outlined':
      return {
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${main} 8%, transparent)`,
          borderColor: main,
        },
        backgroundColor: 'transparent',
        border: `1px solid color-mix(in srgb, ${main} 50%, transparent)`,
        color: main,
      };
    case 'text':
      return {
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${main} 8%, transparent)`,
        },
        backgroundColor: 'transparent',
        border: 'none',
        color: main,
      };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

export type ButtonProps<T extends ElementType = 'button'> = {
  children?: ReactNode;
  className?: string;
  color?: ButtonColor;
  component?: T;
  disabled?: boolean;
  disableRipple?: boolean;
  endIcon?: ReactNode;
  href?: string;
  ref?: Ref<HTMLElement>;
  size?: ButtonSize;
  startIcon?: ReactNode;
  sx?: SxProps;
  variant?: ButtonVariant;
} & Omit<
  ComponentPropsWithRef<T>,
  | 'children'
  | 'className'
  | 'color'
  | 'component'
  | 'disabled'
  | 'disableRipple'
  | 'endIcon'
  | 'size'
  | 'startIcon'
  | 'sx'
  | 'variant'
>;

export function Button<T extends ElementType = 'button'>({
  children,
  className,
  color = 'primary',
  component,
  disabled,
  disableRipple: _disableRipple,
  endIcon,
  href,
  ref,
  size = 'medium',
  startIcon,
  sx,
  type,
  variant = 'contained',
  ...rest
}: ButtonProps<T>) {
  const Component = (component ?? (href ? 'a' : 'button')) as ElementType;
  const baseSx: SxObject = {
    alignItems: 'center',
    borderRadius: '8px',
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: 600,
    gap: '8px',
    justifyContent: 'center',
    lineHeight: 1.75,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    textDecoration: 'none',
    textTransform: 'initial',
    transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
    userSelect: 'none',
    verticalAlign: 'middle',
    ...SIZE_STYLES[size],
    ...getVariantStyles(variant, color),
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  const buttonType = Component === 'button' ? (type ?? 'button') : type;

  return (
    <>
      <SxStyle compiled={compiled} />
      <Component
        className={joinClasses(compiled?.className, className)}
        disabled={Component === 'button' ? disabled : undefined}
        href={href}
        ref={ref}
        type={buttonType}
        {...rest}
      >
        {startIcon ? <span style={{ display: 'inline-flex' }}>{startIcon}</span> : null}
        {children}
        {endIcon ? <span style={{ display: 'inline-flex' }}>{endIcon}</span> : null}
      </Component>
    </>
  );
}
