import useScrollPosition from 'hooks/useScrollPosition';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import Stack from './Stack';

// Amount in px we have to scroll to get the fancy effect on the logo
const THRESHOLD = 80;

/**
 * Creates a blob element that appears behind the logo when scrolled
 * down on the page. Imports without SSR to force client-side rendering
 * only (see `Blob` for more about this). Scales it up and offscreen
 * quite a bit to make it the background of the logo visually. Shows
 * only once we scroll down.
 */
const LogoBlobBackground = styled(dynamic(() => import('./Blob'), { ssr: false })).attrs({
  fill: 'var(--background-color)',
  hoveredFill: 'var(--primary)',
})<{
  $isBlobBackgroundVisible: boolean;
}>`
  position: absolute;
  top: -400%;
  left: -550%;
  width: 900%;
  height: 600%;
  filter: var(--filter-drop-shadow);
  transition: transform var(--transition), opacity var(--transition);
  opacity: 0;
  z-index: -1;
  will-change: transform, opacity;
  ${({ $isBlobBackgroundVisible }) =>
    $isBlobBackgroundVisible &&
    css`
      opacity: 1;
      :hover {
        transform: rotate(-10deg);
      }
    `}
`;

/**
 * Big, bold, and squished text for use as logo, with Inter font
 * (loaded on all pages via document.tsx)
 */
const LogoText = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-weight: 800;
  letter-spacing: -0.12em;
`;

/**
 * Contains all elements, relatively positioned so we can
 * absolutely position the blob. If we scroll down, adds a
 * hover effect to indicate clickability.
 */
const Container = styled.div<{ $isBlobBackgroundVisible: boolean }>`
  position: relative;
  font-size: 2.5em;
  color: var(--secondary);
  transform-origin: top left;
  transition: color var(--transition), transform var(--transition);
  ${({ $isBlobBackgroundVisible }) =>
    $isBlobBackgroundVisible &&
    css`
      transform: scale(0.64);
      &:hover {
        color: #ffffff;
      }
    `}
`;

/**
 * Arrow up to show scrollability. Fades in, and is on own layer to
 * prevent jittering as it fades in.
 */
const ScrollUpIndicator = styled(Stack)<{ $isBlobBackgroundVisible: boolean }>`
  margin-left: 0.25em;
  font-size: 0.45em;
  letter-spacing: 0.03em;
  font-weight: 600;
  transition: opacity var(--transition);
  will-change: transform;
  ${({ $isBlobBackgroundVisible }) => css`
    opacity: ${$isBlobBackgroundVisible ? 1 : 0};
  `}
`;

/**
 * Creates a logo out of plain text + a "blob" that appears behind it.
 * The blob only appears when you scroll down the page, and with the
 * blob, there's a scroll to top button to jump you up.
 */
const Logo = () => {
  const { scrollY } = useScrollPosition();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [blobSeed, setBlobSeed] = useState(Math.random());
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const isBlobBackgroundVisible = useMemo(() => !!scrollY && scrollY > THRESHOLD, [scrollY]);

  // Save last scroll Y if we went beyond the threshold
  useEffect(
    () => setLastScrollY(scrollY && isBlobBackgroundVisible ? scrollY : -1),
    [isBlobBackgroundVisible, scrollY],
  );

  // If we scroll under the threshold (up to top of page), refresh seed - intentionally delayed & NOT cancelled so it actually finishes
  useEffect(() => {
    if (scrollY && !isBlobBackgroundVisible && lastScrollY > THRESHOLD) {
      setTimeout(() => setBlobSeed(Math.random()), 200);
    }
  }, [blobSeed, isBlobBackgroundVisible, lastScrollY, scrollY]);

  return (
    <Container $isBlobBackgroundVisible={isBlobBackgroundVisible}>
      <LogoBlobBackground
        seed={blobSeed}
        onClick={isBlobBackgroundVisible ? scrollToTop : undefined}
        $isBlobBackgroundVisible={isBlobBackgroundVisible}
      />
      <LogoText aria-hidden>dg.</LogoText>
      <ScrollUpIndicator
        $isBlobBackgroundVisible={isBlobBackgroundVisible}
        $gap="2px"
        $alignItems="center"
      >
        To Top
        <FiArrowUp />
      </ScrollUpIndicator>
    </Container>
  );
};

export default Logo;
