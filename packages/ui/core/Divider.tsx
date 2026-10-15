import type { HTMLAttributes } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

const dividerBaseSx: SxObject = {
  borderBottomWidth: 'thin',
  borderColor: 'var(--mui-palette-divider)',
  borderStyle: 'solid',
  borderWidth: 0,
  flexShrink: 0,
  margin: 0,
};

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  sx?: SxProps;
};

export function Divider({ className, sx, ...rest }: DividerProps) {
  const mergedSx: SxProps = Array.isArray(sx) ? [dividerBaseSx, ...sx] : [dividerBaseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <hr className={joinClasses(compiled?.className, className)} {...rest} />
    </>
  );
}
