import { Box, BoxProps } from '@mui/material';
import { Theme, SxProps } from '@mui/material/styles';
import { Children } from 'react';
import { mixinSx } from '../../ui/helpers/mixinSx';

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
      }
  );

// Applied to anything interactive
const INTERACTIVE_SX: SxProps<Theme> = {
  padding: '0.5rem',
  cursor: 'pointer',
  color: 'var(--color)',
  backgroundColor: 'var(--background-color)',
  transition: 'color var(--transition), background-color var(--transition)',
  ':hover': {
    backgroundColor: 'var(--secondary-hover)',
    color: 'var(--secondary-inverse)',
  },
};

/**
 * Renders one single control
 */
function Container({ isSingular, ...props }: { isSingular?: boolean } & BoxProps) {
  return (
    <Box
      {...props}
      sx={mixinSx(
        {
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          width: '100%',
          borderRadius: 'var(--border-radius)',
          boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
          fontSize: '1rem',
          lineHeight: '1',
          ...(isSingular &&
            mixinSx(
              {
                ':before': {
                  content: '""',
                  display: 'block',
                  paddingTop: '100%',
                },
              },
              INTERACTIVE_SX,
            )),
        },
        props.sx,
      )}
    />
  );
}

/**
 * This is what surrounds any control to contain it, automatically responding
 * to the color scheme. Circular and same width/height. Returns either a single
 * container, or a larger container with multiple children in it if necessary.
 */
export function ControlContainer({ onClick, children, className }: ControlContainerProps) {
  if (!Array.isArray(children)) {
    return (
      <Container isSingular onClick={onClick}>
        {children}
      </Container>
    );
  }

  return (
    <Container className={className}>
      {Children.map(children, (child) => (
        <Box sx={INTERACTIVE_SX} onClick={child.props.onClick}>
          {child}
        </Box>
      ))}
    </Container>
  );
}
