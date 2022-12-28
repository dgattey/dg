import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';
import { Button, Typography } from '@mui/material';
import { SxProps } from 'ui/theme';
import { ScrollIndicatorContext } from './ScrollIndicatorContext';

const scrolledSx: SxProps = {
  transform: 'initial',
  cursor: 'pointer',
  opacity: 1,
  '&:hover': {
    background: (theme) => theme.vars.palette.secondary.dark,
    color: (theme) => theme.palette.getContrastText(theme.palette.secondary.dark),
    transform: 'scale(1.05)',
  },
};

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
export function ScrollUpButton() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Button
      disabled={!isScrolled}
      variant="text"
      color="secondary"
      onClick={scrollToTop}
      sx={{
        color: (theme) => theme.vars.palette.text.primary,
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        opacity: 0,
        transform: 'translateY(-200%)',
        paddingX: 1.25,
        paddingY: 0.5,
        transition: (theme) =>
          theme.transitions.create(['opacity', 'transform', 'color', 'background-color']),
        willChange: 'transform',
        ...(isScrolled && scrolledSx),
      }}
    >
      <Typography variant="caption">To top</Typography>
      <ArrowUp size={16} />
    </Button>
  );
}
