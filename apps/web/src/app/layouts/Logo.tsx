'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { usePathname } from 'next/navigation';
import type { CSSProperties, MouseEvent } from 'react';
import { MARK_PATHS, MARK_VIEW_BOX } from './logoMark';

const markStyle: CSSProperties = {
  display: 'block',
  height: '0.88em',
  margin: '0.18em -0.062em -0.06em 0.022em',
  overflow: 'visible',
  width: 'auto',
};

const logoLinkSx: SxObject = {
  '&:focus-visible': {
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    color: 'var(--cream)',
    textDecoration: 'none',
    transform: 'scale(1.05)',
  },
  alignItems: 'center',
  color: 'var(--cream)',
  display: 'flex',
  flexShrink: 0,
  fontSize: '2.25em',
  justifyContent: 'center',
  lineHeight: 1,
  paddingBlock: 1,
  paddingInline: 1.5,
  textDecoration: 'none',
  ...createBouncyTransition(['box-shadow', 'color', 'transform']),
  willChange: 'transform',
};

export function Logo() {
  const pathname = usePathname() ?? '/';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeRoute) {
      event.preventDefault();
      window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  return (
    <Link
      className="c-logo chrome__logo"
      href={homeRoute}
      onClick={handleClick}
      sx={logoLinkSx}
      transitionTypes={pageTransitionTypes('close')}
    >
      <svg
        aria-label="dg."
        fill="currentColor"
        role="img"
        style={markStyle}
        viewBox={MARK_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
      >
        {MARK_PATHS.map(({ d, dx }) => (
          <path d={d} key={dx} transform={dx ? `translate(${dx} 0)` : undefined} />
        ))}
      </svg>
    </Link>
  );
}
