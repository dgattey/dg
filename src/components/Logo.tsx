import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { SxProps, Theme, Box } from '@mui/material';
import { ScrollIndicatorContext } from './ScrollIndicatorContext';

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const logoTextStyles =
  (isScrolled: boolean): SxProps<Theme> =>
  (theme) => ({
    fontSize: '3rem',
    fontVariationSettings: "'wght' 800, 'wdth' 120",
    letterSpacing: '-0.12em',
    lineHeight: 0.75, // visually center the text
    color: 'rgb(22, 172, 126)',
    paddingY: 1,
    paddingX: 0,

    transition: theme.transitions.create(['font-size', 'transform']),
    willChange: 'font-size, transform',
    ...(isScrolled && {
      fontSize: '2rem',
      padding: 0,
    }),
  });

/**
 * Logo + scroll to top button, with certain changes that happen on
 * scroll.
 */
export function Logo() {
  const router = useRouter();
  const linkedLogoText = router.asPath === '/' ? 'dg.' : <Link href="/">dg.</Link>;
  const isScrolled = useContext(ScrollIndicatorContext);
  return <Box sx={logoTextStyles(isScrolled)}>{linkedLogoText}</Box>;
}
