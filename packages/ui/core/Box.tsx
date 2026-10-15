import type { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

export type BoxProps<T extends ElementType = 'div'> = {
  children?: ReactNode;
  className?: string;
  component?: T;
  ref?: Ref<HTMLElement>;
  sx?: SxProps;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> &
  Omit<ComponentPropsWithRef<T>, 'children' | 'className' | 'component' | 'sx'>;

export function Box<T extends ElementType = 'div'>({
  children,
  className,
  component,
  ref,
  sx,
  ...rest
}: BoxProps<T>) {
  const Component = (component ?? 'div') as ElementType;
  const compiled = compileSx(sx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <Component className={joinClasses(compiled?.className, className)} ref={ref} {...rest}>
        {children}
      </Component>
    </>
  );
}
