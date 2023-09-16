import { Box, BoxProps } from '@mui/material';

/**
 * Adds a transition and transform up on hover. Meant for use with images.
 */
export function HoverableContainer({ isHovered, ...props }: BoxProps & { isHovered: boolean }) {
  return (
    <Box
      {...props}
      sx={(theme) => ({
        transform: `scale(${isHovered ? 1.05 : 1})`,
        transition: theme.transitions.create(['transform']),
      })}
    />
  );
}
