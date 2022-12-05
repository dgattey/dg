import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';
import { SxProps, Theme, Typography } from '@mui/material';
import { HorizontalStack } from 'ui/HorizontalStack';
import { ScrollIndicatorContext } from './ScrollIndicatorContext';

const scrolledSx: SxProps<Theme> = {
  transform: 'initial',
  cursor: 'pointer',
  opacity: 1,
  '&:hover': {
    background: (theme) => theme.palette.primary.main,
    color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
    transform: 'scale(1.05)',
  },
};

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
export function ScrollUpIndicator() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <HorizontalStack
      onClick={scrollToTop}
      sx={{
        gap: 0.25,
        alignItems: 'center',
        opacity: 0,
        transform: 'translateY(-200%) translateX(-25%)',
        borderRadius: 6,
        paddingX: 1.25,
        paddingY: 0.75,
        transition: (theme) =>
          theme.transitions.create(['opacity', 'transform', 'color', 'background-color']),
        willChange: 'transform',
        ...(isScrolled && scrolledSx),
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: (theme) => theme.typography.fontWeightBold,
        }}
      >
        To top
      </Typography>
      <ArrowUp size="0.85rem" />
    </HorizontalStack>
  );
}
