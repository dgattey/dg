import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

const iconButtonBaseSx: SxObject = {
  '&:hover': {
    backgroundColor: 'var(--mui-palette-action-hover)',
  },
  alignItems: 'center',
  appearance: 'none',
  backgroundColor: 'transparent',
  border: 0,
  borderRadius: '50%',
  boxSizing: 'border-box',
  color: 'var(--mui-palette-action-active)',
  cursor: 'pointer',
  display: 'inline-flex',
  flex: '0 0 auto',
  justifyContent: 'center',
  margin: 0,
  outline: 0,
  padding: '8px',
  position: 'relative',
  textAlign: 'center',
  textDecoration: 'none',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  userSelect: 'none',
  verticalAlign: 'middle',
};

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps;
};

export function IconButton({
  children,
  className,
  ref,
  size = 'medium',
  sx,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const sizePadding = size === 'small' ? '5px' : size === 'large' ? '12px' : '8px';
  const sizeFontSize =
    size === 'small' ? '1.40625rem' : size === 'large' ? '2.1875rem' : '1.875rem';
  const baseSx: SxObject = {
    ...iconButtonBaseSx,
    fontSize: sizeFontSize,
    padding: sizePadding,
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <button
        className={joinClasses(compiled?.className, className)}
        ref={ref}
        type={type}
        {...rest}
      >
        {children}
      </button>
    </>
  );
}
