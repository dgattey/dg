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
  color: 'var(--mui-palette-action-active)',
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  margin: 0,
  outline: 0,
  padding: '8px',
  position: 'relative',
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
  const baseSx: SxObject = {
    ...iconButtonBaseSx,
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
