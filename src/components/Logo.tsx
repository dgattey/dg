import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import styled, { css } from 'styled-components';
import ScrollIndicatorContext from './ScrollIndicatorContext';
import ScrollUpIndicator from './ScrollUpIndicator';
import Stack from './Stack';

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const LogoText = styled.article<{ $isScrolled: boolean }>`
  --padding: 1rem;
  --margin: 1rem;
  font-size: 2.5rem;
  font-variation-settings: 'wght' 800, 'wdth' 120;
  letter-spacing: -0.12em;

  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  vertical-align: middle;
  line-height: 1;
  margin: var(--margin) -0.5rem;
  padding: var(--padding);
  pointer-events: auto;
  transform-origin: top left;
  transition: box-shadow var(--transition), transform var(--transition),
    background-color var(--transition), border-color var(--transition);
  will-change: transform;
  color: rgb(22, 172, 126);
  border: 2px solid transparent;
  z-index: 1;

  @media (max-width: 767.96px) {
    --margin: 0.5rem;
  }

  &:before {
    content: '';
    float: left;
    width: auto;
    padding-bottom: 100%;
  }

  ${({ $isScrolled }) =>
    $isScrolled
      ? css`
          border: 2px solid var(--card-border-color);
          transform: scale(0.75);
        `
      : css`
          background: var(--background-color);
          box-shadow: none;
        `}
`;

const SpacedScrollIndicator = styled(ScrollUpIndicator)<{ $isScrolled: boolean }>`
  ${({ $isScrolled }) =>
    $isScrolled &&
    css`
      &:hover {
        transform: scale(1.05);
      }
    `}
  margin-left: -0.5rem;
  margin-top: 2rem;
`;

const StyledLink = styled.a``;

/**
 * Logo + scroll to top button, with certain changes that happen on
 * scroll.
 */
const Logo = () => {
  const router = useRouter();
  const isScrolled = useContext(ScrollIndicatorContext);
  const linkedLogoText =
    router.asPath === '/' ? (
      'dg.'
    ) : (
      <Link href="/" passHref>
        <StyledLink>dg.</StyledLink>
      </Link>
    );
  return (
    <Stack $alignItems="flex-start">
      <LogoText $isScrolled={isScrolled}>{linkedLogoText}</LogoText>
      <SpacedScrollIndicator $isScrolled={isScrolled} />
    </Stack>
  );
};

export default Logo;
