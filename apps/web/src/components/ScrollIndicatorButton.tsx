'use client';

import { GlassContainer } from '@dg/ui/core/GlassContainer';
import { ScrollIndicatorContext } from '@dg/ui/core/ScrollIndicatorContext';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, Button, Typography } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';

const scrollIndicatorBaseSx: SxObject = {
  ...createBouncyTransition(['opacity', 'transform', 'color', 'background-color']),
  opacity: 0,
  paddingBlock: 0.5,
  paddingInline: 0,
  transform: 'translateY(-100%)',
  willChange: 'transform',
};

/** Scroll indicator styles when scrolled */
const scrollIndicatorScrolledSx: SxObject = {
  '&:hover': {
    background: 'color-mix(in srgb, var(--mui-palette-background-default) 50%, transparent)',
    color: 'var(--mui-palette-text-primary)',
    transform: 'scale(1.05)',
  },
  ...createBouncyTransition(['opacity', 'transform', 'color', 'background-color']),
  cursor: 'pointer',
  opacity: 1,
  paddingBlock: 0.5,
  paddingInline: 0,
  transform: 'translateX(0)',
  willChange: 'transform',
};

const scrollIndicatorButtonSx: SxObject = {
  alignItems: 'center',
  color: 'var(--mui-palette-text-primary)',
  display: 'flex',
  gap: 0.5,
  textWrap: 'nowrap',
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
    <GlassContainer sx={isScrolled ? scrollIndicatorScrolledSx : scrollIndicatorBaseSx}>
      <Button
        color="secondary"
        disabled={!isScrolled}
        onClick={scrollToTop}
        sx={scrollIndicatorButtonSx}
        variant="text"
      >
        <Typography variant="caption">To top</Typography>
        <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
          <ArrowUp size={16} />
        </Box>
      </Button>
    </GlassContainer>
  );
}
