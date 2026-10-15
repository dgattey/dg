import type { ComponentPropsWithRef, ElementType, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'contained' | 'outlined' | 'text';

const SIZE_STYLES: Record<ButtonSize, SxObject> = {
  large: {
    fontSize: '1.1607142857142858rem',
    padding: '8px 20px',
  },
  medium: {
    fontSize: '1.0714285714285714rem',
    padding: '6px 16px',
  },
  small: {
    fontSize: '0.9821428571428572rem',
    padding: '4px 12px',
  },
};

function getVariantStyles(
  variant: ButtonVariant,
  color: ButtonColor,
  disabled?: boolean,
): SxObject {
  const main = `var(--mui-palette-${color}-main)`;
  const dark = `var(--mui-palette-${color}-dark)`;
  const contrast = `var(--mui-palette-${color}-contrastText)`;

  switch (variant) {
    case 'contained':
      if (disabled) {
        return {
          backgroundColor: 'var(--mui-palette-action-disabledBackground)',
          border: 0,
          boxShadow: 'none',
          color: 'var(--mui-palette-action-disabled)',
        };
      }
      return {
        '&:hover': {
          backgroundColor: dark,
          boxShadow:
            '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
        backgroundColor: main,
        border: 0,
        boxShadow:
          '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        color: contrast,
      };
    case 'outlined':
      if (disabled) {
        return {
          backgroundColor: 'transparent',
          border: '1px solid var(--mui-palette-action-disabledBackground)',
          color: 'var(--mui-palette-action-disabled)',
        };
      }
      return {
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${main} 4%, transparent)`,
          borderColor: main,
        },
        backgroundColor: 'transparent',
        border: `1px solid ${main}`,
        color: main,
      };
    case 'text':
      if (disabled) {
        return {
          backgroundColor: 'transparent',
          border: 0,
          color: 'var(--mui-palette-action-disabled)',
        };
      }
      return {
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${main} 4%, transparent)`,
        },
        backgroundColor: 'transparent',
        border: 0,
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
    boxSizing: 'border-box',
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: 600,
    justifyContent: 'center',
    lineHeight: 1.75,
    margin: 0,
    minWidth: '64px',
    outline: 0,
    pointerEvents: disabled ? 'none' : 'auto',
    position: 'relative',
    textDecoration: 'none',
    textTransform: 'initial',
    transition:
      'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    userSelect: 'none',
    verticalAlign: 'middle',
    ...SIZE_STYLES[size],
    ...getVariantStyles(variant, color, disabled),
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
        {startIcon ? (
          <span
            style={{
              alignItems: 'center',
              display: 'inherit',
              marginLeft: '-4px',
              marginRight: '8px',
            }}
          >
            {startIcon}
          </span>
        ) : null}
        {children}
        {endIcon ? (
          <span
            style={{
              alignItems: 'center',
              display: 'inherit',
              marginLeft: '8px',
              marginRight: '-4px',
            }}
          >
            {endIcon}
          </span>
        ) : null}
      </Component>
    </>
  );
}
