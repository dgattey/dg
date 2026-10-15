import type { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

const cardBaseSx: SxObject = {
  background: 'var(--mui-palette-background-paper)',
  borderColor: 'var(--mui-palette-card-border)',
  borderRadius: 'var(--mui-shape-cardBorderRadius)',
  borderStyle: 'solid',
  borderWidth: 'thin',
  boxShadow: 'var(--mui-extraShadows-card-main)',
  color: 'var(--mui-palette-text-primary)',
  overflow: 'hidden',
};

export type CardProps<T extends ElementType = 'div'> = {
  children?: ReactNode;
  className?: string;
  component?: T;
  ref?: Ref<HTMLElement>;
  sx?: SxProps;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> &
  Omit<ComponentPropsWithRef<T>, 'children' | 'className' | 'component' | 'sx'>;

export function Card<T extends ElementType = 'div'>({
  children,
  className,
  component,
  ref,
  sx,
  ...rest
}: CardProps<T>) {
  const Component = (component ?? 'div') as ElementType;
  const mergedSx: SxProps = Array.isArray(sx) ? [cardBaseSx, ...sx] : [cardBaseSx, sx];
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

const cardContentBaseSx: SxObject = {
  '&:last-child': {
    paddingBottom: 3,
  },
  padding: 2,
};

export function CardContent<T extends ElementType = 'div'>({
  children,
  className,
  component,
  ref,
  sx,
  ...rest
}: CardProps<T>) {
  const Component = (component ?? 'div') as ElementType;
  const mergedSx: SxProps = Array.isArray(sx)
    ? [cardContentBaseSx, ...sx]
    : [cardContentBaseSx, sx];
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
