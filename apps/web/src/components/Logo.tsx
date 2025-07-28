import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { ScrollIndicatorContext } from 'ui/core/ScrollIndicatorContext';
import { Link } from 'ui/dependent/Link';
import { mixinSx } from 'ui/helpers/mixinSx';
import type { SxProps } from 'ui/theme';

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const logoTextStyles =
  (isScrolled: boolean): SxProps =>
  (theme) => ({
    '&': {
      fontSize: '2.5em',
    },
    background: 'none',
    boxShadow: 'none',
    border: 'none',
    borderRadius: 1,
    '&:hover': {
      background: 'none',
      boxShadow: 'none',
      border: 'none',
      color: theme.vars.palette.primary.dark,
      transform: 'scale(1.05)',
    },
    '&:focus-visible': {
      outline: '-webkit-focus-ring-color auto 1px',
      background: 'none',
      boxShadow: 'none',
      border: 'none',
    },
    fontVariationSettings: "'wght' 800, 'wdth' 120",
    letterSpacing: '-0.12em',
    lineHeight: 0.75, // visually center the text
    color: theme.vars.palette.primary.main,
    paddingY: 2,
    paddingX: 0,

    willChange: 'font-size, transform',
    ...(isScrolled && {
      transform: 'scale(0.75)',
      paddingY: 0,
    }),
    transition: theme.transitions.create(['color', 'transform', 'padding', 'font-size']),
  });

/**
 * Logo + scroll to top button, with certain changes that happen on
 * scroll.
 */
export function Logo() {
  const router = useRouter();
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (router.asPath === '/') {
    return (
      <Button disableRipple onClick={scrollToTop} sx={logoTextStyles(isScrolled)}>
        dg.
      </Button>
    );
  }

  return (
    <Link
      href="/"
      linkProps={{ underline: 'none' }}
      sx={mixinSx(
        {
          display: 'block',
        },
        logoTextStyles(isScrolled),
      )}
    >
      dg.
    </Link>
  );
}
