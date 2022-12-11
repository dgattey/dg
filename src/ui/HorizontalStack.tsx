import { BoxProps, Stack, StackProps } from '@mui/material';
import { mixinSx } from 'ui/helpers/mixinSx';

/**
 * Simple version of a horizontal stack using MUI's Box component
 */
export function HorizontalStack({ sx, ...props }: StackProps & Pick<BoxProps, 'component'>) {
  return <Stack {...props} sx={mixinSx({ flexDirection: 'row' }, sx)} />;
}
