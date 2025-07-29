import { Button, Typography } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';
import { ScrollIndicatorContext } from '../core/ScrollIndicatorContext';
import type { SxProps } from '../theme';

const scrolledSx: SxProps = {
  '&:hover': {
    background: (theme) => theme.vars.palette.secondary.dark,
    color: (theme) => theme.vars.palette.text.primary,
    transform: 'scale(1.05)',
  },
  cursor: 'pointer',
  opacity: 1,
  transform: 'initial',
};

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
export function ScrollUpButton() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  return (
    <Button
      color="secondary"
      disabled={!isScrolled}
      onClick={scrollToTop}
      sx={{
        alignItems: 'center',
        color: (theme) => theme.vars.palette.text.primary,
        display: 'flex',
        gap: 0.5,
        opacity: 0,
        paddingX: 1.25,
        paddingY: 0.5,
        transform: 'translateY(-200%)',
        transition: (theme) =>
          theme.transitions.create(['opacity', 'transform', 'color', 'background-color']),
        willChange: 'transform',
        ...(isScrolled && scrolledSx),
      }}
      variant="text"
    >
      <Typography variant="caption">To top</Typography>
      <ArrowUp size={16} />
    </Button>
  );
}
