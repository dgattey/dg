import useData from 'api/useData';
import useScrollPosition from 'hooks/useScrollPosition';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import Link from './Link';

// Amount in px we have to scroll to get the fancy effect on the logo
const THRESHOLD = 80;

// Imports without SSR to avoid the rounding problems causing bugs
const Blob = dynamic(() => import('./Blob'), { ssr: false });

// Uses Inter for header + links up top
const SpacedHeader = styled.header`
  margin-top: var(--spacing);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-weight: 600;
`;

// Absolutely positions & scales up the blob to fit behind the logo, with transitions
const StyledBlob = styled(Blob)`
  z-index: -1;
  position: absolute;
  top: -11em;
  left: -8em;
  width: 14em;
  opacity: 0;
  path {
    transition: fill var(--transition);
    fill: var(--background-color);
  }
  filter: drop-shadow(0 0.125rem 1rem rgba(27, 40, 50, 0.12));
  transition: transform var(--transition), opacity var(--transition), path var(--transition);
`;

// Bold, big, and squishy Inter
const Logo = styled.span<{ $isFancy: boolean }>`
  display: block;
  position: relative;
  color: var(--secondary);
  font-size: 2.5em;
  font-weight: 800;
  letter-spacing: -0.12em;
  transition: transform var(--transition), color var(--transition);
  ${({ $isFancy }) =>
    $isFancy &&
    css`
      cursor: pointer;
      ${StyledBlob} {
        opacity: 1;
      }
      &:hover {
        transform: scale(1.05);
        color: #ffffff;
        ${StyledBlob} {
          path {
            fill: var(--primary);
          }
          transform: rotate(-11deg);
        }
      }
    `}
`;

/**
 * Creates the site header component - shows header links + fancy animated
 * logo blob that scrolls you to top of page when clicked.
 */
const Header = () => {
  const { data: headerLinks } = useData('siteHeader');
  const { scrollY } = useScrollPosition();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [blobSeed, setBlobSeed] = useState(Math.random());

  // If we should show a blob background
  const isFancyLogo = !!scrollY && scrollY > THRESHOLD;
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Save the last scroll Y to crudely determine when we're scrolling under threshold
  useEffect(() => {
    if (!scrollY) {
      return;
    }
    if (scrollY > THRESHOLD) {
      setLastScrollY(scrollY);
    } else {
      setLastScrollY(-1);
    }
  }, [scrollY]);

  // When we scroll under the threshold again, set a new blob seed
  useEffect(() => {
    if (!(scrollY && scrollY <= THRESHOLD && lastScrollY > THRESHOLD)) {
      return;
    }

    // Matches timeout of the standard animation - intentionally NOT cancelled so it actually finishes
    setTimeout(() => setBlobSeed(Math.random()), 200);
  }, [blobSeed, lastScrollY, scrollY]);

  // Each of the header links, mapped
  const linkElements = headerLinks && (
    <ul>
      {headerLinks.map((link) => (
        <li key={link.url}>
          <Link {...link} />
        </li>
      ))}
    </ul>
  );

  // Logo and the blob behind
  const logo = (
    <Logo aria-hidden $isFancy={isFancyLogo} onClick={isFancyLogo ? scrollToTop : undefined}>
      <StyledBlob seed={blobSeed} />
      dg.
      <FiArrowUp
        style={{ opacity: isFancyLogo ? 1 : 0, marginLeft: '0.25em', fontSize: '0.75em' }}
      />
    </Logo>
  );

  return (
    <SpacedHeader>
      <nav>
        <ul>
          <li>{logo}</li>
        </ul>
        {linkElements}
      </nav>
    </SpacedHeader>
  );
};

export default Header;
