'use client';

import { ScrollIndicatorContext } from '@dg/ui/core/ScrollIndicatorContext';
import type { SxObject } from '@dg/ui/theme';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useShowScrollIndicator } from '../../hooks/useShowScrollIndicator';

type ScrollIndicatorShellProps = {
  children: ReactNode;
};

const indicatorAnchorSx: SxObject = {
  height: 0,
  width: 0,
};

/**
 * Client-only shell for header + scroll indicator state.
 */
export function ScrollIndicatorShell({ children }: ScrollIndicatorShellProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const { ref, isIndicatorShown } = useShowScrollIndicator(headerHeight);

  useEffect(() => {
    const headerElement = document.querySelector('[data-site-header]');
    if (!headerElement) {
      return;
    }

    const updateHeight = () => {
      setHeaderHeight(headerElement.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerElement);

    return () => observer.disconnect();
  }, []);

  return (
    <ScrollIndicatorContext.Provider value={isIndicatorShown}>
      {children}
      <Box aria-hidden={true} ref={ref} sx={indicatorAnchorSx} />
    </ScrollIndicatorContext.Provider>
  );
}
