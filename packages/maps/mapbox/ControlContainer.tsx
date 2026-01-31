import type { BoxProps, SxProps, Theme } from '@mui/material';
import { Box } from '@mui/material';
import { Children } from 'react';

export type ControlContainerProps = Pick<React.ComponentProps<'div'>, 'className'> & {
  /**
   * Called when the control itself is clicked
   */
  onClick?: (() => void) | undefined;

  /**
   * Either pass an array or a single child - with clickability built in
   */
  children:
    | Array<React.ReactElement<{ onClick: () => void }>>
    | React.ReactElement<{ onClick?: never }>
    | string
    | boolean;

  /**
   * The theme to use for the control - has to be injected because of how Mapbox works
   */
  theme: Theme;
};

/**
 * Renders one single control - needs theme injection because of how Mapbox works
 */
function Container({ theme, ...props }: Omit<BoxProps, 'sx'> & { theme: Theme }) {
  const containerSx: SxProps<Theme> = {
    borderRadius: theme.spacing(6),
    boxShadow: theme.vars.extraShadows.map.control,
    display: 'flex',
    fontSize: '1rem',
    lineHeight: '1',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  };
  return <Box {...props} sx={containerSx} />;
}

/**
 * This is what surrounds any control to contain it, automatically responding
 * to the color scheme. Circular and same width/height. Returns either a single
 * container, or a larger container with multiple children in it if necessary.
 */
export function ControlContainer({ onClick, children, className, theme }: ControlContainerProps) {
  const controlSx: SxProps<Theme> = {
    ':hover': {
      backgroundColor: theme.vars.palette.secondary.main,
      color: theme.vars.palette.secondary.contrastText,
    },
    backgroundColor: theme.vars.palette.background.default,
    color: theme.vars.palette.text.primary,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0.5rem',
    transition: theme.transitions.create(['background-color', 'color']),
  };

  return (
    <Container
      className={className}
      onClick={Array.isArray(children) ? undefined : onClick}
      theme={theme}
    >
      {Array.isArray(children) ? (
        Children.map(children, (child) => (
          <Box onClick={child.props.onClick} sx={controlSx}>
            {child}
          </Box>
        ))
      ) : (
        <Box onClick={onClick} sx={controlSx}>
          {children}
        </Box>
      )}
    </Container>
  );
}
