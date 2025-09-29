import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { GlassContainer } from 'ui/core/GlassContainer';
import { ScrollIndicatorContext } from 'ui/core/ScrollIndicatorContext';
import { Link } from 'ui/dependent/Link';
import { bouncyTransition } from 'ui/helpers/bouncyTransition';
import { mixinSx } from 'ui/helpers/mixinSx';
import type { SxProps } from 'ui/theme';

const paddingStyles: SxProps = () => ({
  paddingBlock: 1.5,
  paddingInlineEnd: 3,
  paddingInlineStart: 2.5,
});

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const logoTextStyles: SxProps = (theme) => ({
  '&': {
    fontSize: '2.25em',
  },
  '&:focus-visible': {
    background: 'none',
    boxShadow: 'none',
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    background: 'none',
    boxShadow: 'none',
    color: theme.vars.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  alignItems: 'center',
  boxShadow: 'none',
  color: theme.vars.palette.primary.main,
  display: 'flex',
  fontVariationSettings: "'wght' 800, 'wdth' 120",
  justifyContent: 'center',
  letterSpacing: '-0.12em',
  lineHeight: 1,
  ...bouncyTransition(theme, ['color', 'transform']),
  background: 'none',
  willChange: 'transform',
});

const scrolledSx: SxProps = {
  opacity: 1,
  transform: 'translateX(0)',
};

const containerSx: SxProps = {
  position: 'relative',
  zIndex: 1,
};

const getGlassContainerSx =
  (dimensions: { width: number; height: number }): SxProps =>
  (theme) => ({
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    transform: 'translateX(-100%)',
    willChange: 'transform',
    zIndex: -1,
    ...bouncyTransition(theme, ['opacity', 'transform']),
    borderRadius: theme.spacing(4),
    height: dimensions.height,
    width: dimensions.width,
  });

/**
 * The actual logo content - either a button or link depending on route
 */
const LogoContent = React.forwardRef<HTMLAnchorElement & HTMLButtonElement>((_, ref) => {
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  if (router.asPath === '/') {
    return (
      <Button
        disableRipple={true}
        onClick={scrollToTop}
        ref={ref}
        sx={mixinSx(logoTextStyles, containerSx, paddingStyles)}
      >
        dg.
      </Button>
    );
  }

  return (
    <Link
      href="/"
      linkProps={{ underline: 'none' }}
      ref={ref}
      sx={mixinSx(logoTextStyles, containerSx, paddingStyles, { textDecoration: 'none' })}
    >
      dg.
    </Link>
  );
});

/**
 * Logo + scroll to top button, with glass container that appears on scroll
 */
export function Logo() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  const measureRef = useRef<(HTMLAnchorElement & HTMLButtonElement) | null>(null);

  useEffect(() => {
    if (!measureRef.current) return;

    const updateDimensions = () => {
      if (measureRef.current) {
        const { offsetWidth, offsetHeight } = measureRef.current;
        setDimensions({
          height: offsetHeight,
          width: offsetWidth,
        });
      }
    };

    // Initial measurement
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(measureRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <GlassContainer
        aria-hidden
        sx={mixinSx(getGlassContainerSx(dimensions), isScrolled ? scrolledSx : null, paddingStyles)}
      />
      <LogoContent ref={measureRef} />
    </Box>
  );
}
