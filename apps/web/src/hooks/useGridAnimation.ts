import { useTheme } from '@mui/material';
import type { WrapGridArguments } from 'animate-css-grid/dist/types';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Swaps pointer events between being disabled and auto on the children to
 * avoid slowdowns as the browser tries to compute a hover effect as it
 * animates.
 */
const changePointerEvents = (isOn: boolean) => (animatedChildren: HTMLElement[]) => {
  animatedChildren.forEach((child) => {
    // eslint-disable-next-line no-param-reassign
    child.style.pointerEvents = isOn ? 'auto' : 'none';
  });
};

/**
 * Hook used to dynamically import the `animate-css-grid` library
 * and animate a ref when necessary.
 */
export const useGridAnimation = (gridRef: React.RefObject<HTMLDivElement>) => {
  const theme = useTheme();
  const hasImportedLib = useRef(false);
  const wrapGridRef = useRef<
    | ((container: HTMLElement, args: WrapGridArguments | undefined) => { unwrapGrid: () => void })
    | null
  >(null);
  const unwrapGridRef = useRef<(() => void) | null>(null);

  /**
   * Uses refs so we can be sure that we wrap the grid with animations exactly once.
   * Imports the animation library (and this is called from an effect) so we don't
   * do that on the server where it's unneeded.
   */
  const importLibrary = useCallback(async () => {
    if (!gridRef.current) {
      hasImportedLib.current = false;
      return;
    }
    if (hasImportedLib.current) {
      return;
    }
    hasImportedLib.current = true;
    try {
      if (wrapGridRef.current) {
        return;
      }
      const { wrapGrid } = await import('animate-css-grid');
      wrapGridRef.current = wrapGrid;
    } catch {
      hasImportedLib.current = false;
    }
  }, [gridRef]);

  /**
   * Simply stops the animation by removing the library's wrapper
   * around the gridRef
   */
  const turnOffAnimation = useCallback(() => {
    unwrapGridRef.current?.();
    unwrapGridRef.current = null;
  }, []);

  /**
   * Starts the animation by wrapping the grid in a mutation
   * observer, and stopping the animation after it's been used
   * once so that it's not on later.
   */
  const turnOnAnimation = useCallback(() => {
    if (!gridRef.current || !wrapGridRef.current) {
      return;
    }
    const gridWrapResult = wrapGridRef.current(gridRef.current, {
      stagger: 10,
      duration: theme.transitions.duration.standard,
      easing: 'backOut',
      onStart: changePointerEvents(false),
      onEnd: (animatedChildren) => {
        changePointerEvents(true)(animatedChildren);
        turnOffAnimation();
      },
    });
    unwrapGridRef.current = gridWrapResult.unwrapGrid;
  }, [gridRef, theme.transitions.duration.standard, turnOffAnimation]);

  // Make sure we import the library to start with
  useEffect(() => {
    (() => importLibrary())();
  }, [importLibrary]);

  return turnOnAnimation;
};
