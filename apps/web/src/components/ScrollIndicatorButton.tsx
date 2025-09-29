import { Button, Typography } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';
import { GlassContainer } from 'ui/core/GlassContainer';
import { ScrollIndicatorContext } from 'ui/core/ScrollIndicatorContext';
import { bouncyTransition } from 'ui/helpers/bouncyTransition';
import { mixinSx } from 'ui/helpers/mixinSx';
import type { SxProps } from 'ui/theme';

const scrolledSx: SxProps = {
  '&:hover': {
    background: (theme) =>
      `color-mix(in srgb, ${theme.vars.palette.background.default} 50%, transparent)`,
    color: (theme) => theme.vars.palette.text.primary,
    transform: 'scale(1.05)',
  },
  cursor: 'pointer',
  opacity: 1,
  transform: 'translateX(0)',
};

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
export function ScrollIndicatorButton() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  return (
    <GlassContainer
      sx={mixinSx(
        (theme) => ({
          opacity: 0,
          paddingBlock: 0.5,
          paddingInline: 0,
          transform: 'translateY(-100%)',
          willChange: 'transform',
          ...bouncyTransition(theme, ['opacity', 'transform', 'color', 'background-color']),
        }),
        isScrolled ? scrolledSx : null,
      )}
    >
      <Button
        color="secondary"
        disabled={!isScrolled}
        onClick={scrollToTop}
        sx={{
          alignItems: 'center',
          color: (theme) => theme.vars.palette.text.primary,
          display: 'flex',
          gap: 0.5,
          textWrap: 'nowrap',
        }}
        variant="text"
      >
        <Typography variant="caption">To top</Typography>
        <ArrowUp size={16} style={{ flexShrink: 0 }} />
      </Button>
    </GlassContainer>
  );
}
