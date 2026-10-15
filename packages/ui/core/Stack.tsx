import type { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { ResponsiveValue, SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

type StackDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type StackProps<T extends ElementType = 'div'> = {
  children?: ReactNode;
  className?: string;
  component?: T;
  direction?: ResponsiveValue<StackDirection>;
  ref?: Ref<HTMLElement>;
  spacing?: ResponsiveValue<number | string>;
  sx?: SxProps;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> &
  Omit<
    ComponentPropsWithRef<T>,
    'children' | 'className' | 'component' | 'direction' | 'spacing' | 'sx'
  >;

export function Stack<T extends ElementType = 'div'>({
  children,
  className,
  component,
  direction = 'column',
  ref,
  spacing,
  sx,
  ...rest
}: StackProps<T>) {
  const Component = (component ?? 'div') as ElementType;
  const baseSx: SxObject = {
    display: 'flex',
    flexDirection: direction,
    ...(spacing !== undefined ? { gap: spacing } : {}),
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
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
