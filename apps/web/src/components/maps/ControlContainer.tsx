import { Box, BoxProps, Theme } from '@mui/material';
import { Children } from 'react';

export type ControlContainerProps = Pick<React.ComponentProps<'div'>, 'className'> &
  (
    | {
        /**
         * Called when the control itself is clicked
         */
        onClick: (() => void) | undefined;

        /**
         * Children need to be defined and not be clickable
         */
        children: React.ReactElement<{ onClick?: never }> | string | boolean;

        /**
         * We have to pass it through this way because of how we nest the controls
         */
        theme: Theme;
      }
    | {
        /**
         * Children each provide their own onClick
         */
        onClick?: never;

        /**
         * If children is an array, they're each responsible for passing their own onClicks!
         */
        children: Array<React.ReactElement<{ onClick: () => void }>>;

        /**
         * We have to pass it through this way because of how we nest the controls
         */
        theme: Theme;
      }
  );

/**
 * Renders one single control
 */
function Container({ theme, ...props }: Omit<BoxProps, 'sx'> & { theme: Theme }) {
  return (
    <Box
      {...props}
      sx={{
        boxShadow: theme.vars.extraShadows.map.control,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        width: '100%',
        borderRadius: theme.spacing(6),
        fontSize: '1rem',
        lineHeight: '1',
      }}
    />
  );
}

/**
 * This is what surrounds any control to contain it, automatically responding
 * to the color scheme. Circular and same width/height. Returns either a single
 * container, or a larger container with multiple children in it if necessary.
 */
export function ControlContainer({ onClick, children, className, theme }: ControlContainerProps) {
  const controlSx = {
    display: 'flex',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0.5rem',
    cursor: 'pointer',
    color: theme.vars.palette.text.primary,
    backgroundColor: theme.vars.palette.background.default,
    transition: theme.transitions.create(['background-color', 'color']),
    ':hover': {
      backgroundColor: theme.vars.palette.secondary.main,
      color: theme.vars.palette.secondary.contrastText,
    },
  };

  return (
    <Container
      className={className}
      onClick={!Array.isArray(children) ? onClick : undefined}
      theme={theme}
    >
      {Array.isArray(children) ? (
        Children.map(children, (child) => (
          <Box sx={controlSx} onClick={child.props.onClick}>
            {child}
          </Box>
        ))
      ) : (
        <Box sx={controlSx} onClick={onClick}>
          {children}
        </Box>
      )}
    </Container>
  );
}
