import type { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

const containerBaseSx: SxObject = {
  '@media (min-width: 576px)': {
    maxWidth: '510px',
    paddingInline: 0,
  },
  '@media (min-width: 768px)': {
    maxWidth: '700px',
  },
  '@media (min-width: 992px)': {
    maxWidth: '920px',
  },
  '@media (min-width: 1200px)': {
    maxWidth: '1130px',
  },
  boxSizing: 'border-box',
  marginInline: 'auto',
  paddingInline: '16px',
  width: '100%',
};

export type ContainerProps<T extends ElementType = 'div'> = {
  children?: ReactNode;
  className?: string;
  component?: T;
  fixed?: boolean;
  ref?: Ref<HTMLElement>;
  sx?: SxProps;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> &
  Omit<ComponentPropsWithRef<T>, 'children' | 'className' | 'component' | 'fixed' | 'sx'>;

export function Container<T extends ElementType = 'div'>({
  children,
  className,
  component,
  fixed: _fixed,
  ref,
  sx,
  ...rest
}: ContainerProps<T>) {
  const Component = (component ?? 'div') as ElementType;
  const mergedSx: SxProps = Array.isArray(sx) ? [containerBaseSx, ...sx] : [containerBaseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <Component className={joinClasses(compiled?.className, className)} ref={ref} {...rest}>
        {children}
      </Component>
    </>
  );
}
