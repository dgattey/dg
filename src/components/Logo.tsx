import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { ScrollIndicatorContext } from './ScrollIndicatorContext';

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const LogoText = styled.div<{ isScrolled: boolean }>(
  ({ isScrolled }) => css`
    font-size: 2.5rem;
    font-variation-settings: 'wght' 800, 'wdth' 120;
    letter-spacing: -0.12em;
    line-height: 0.75; // visually center the text
    pointer-events: auto;
    color: rgb(22, 172, 126);
    padding: 1rem 0;

    transition: font-size var(--transition), padding var(--transition);
    will-change: font-size;
    ${isScrolled &&
    css`
      &:hover {
        transform: scale(1.05);
      }
      font-size: 1.75rem;
      padding: 0;
    `}
  `,
);

/**
 * Logo + scroll to top button, with certain changes that happen on
 * scroll.
 */
export function Logo() {
  const router = useRouter();
  const linkedLogoText = router.asPath === '/' ? 'dg.' : <Link href="/">dg.</Link>;
  const isScrolled = useContext(ScrollIndicatorContext);
  return <LogoText isScrolled={isScrolled}>{linkedLogoText}</LogoText>;
}
