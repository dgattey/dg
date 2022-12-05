import { Box } from '@mui/material';

/**
 * Simple version of a horizontal stack using MUI's Box component
 */
export function HorizontalStack(props: React.ComponentProps<typeof Box>) {
  const { sx } = props;
  return <Box {...props} sx={{ display: 'flex', flexDirection: 'row', ...sx }} />;
}
