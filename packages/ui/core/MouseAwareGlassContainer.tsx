'use client';

import { useEffect, useState } from 'react';
import type { UseMouseGravityOptions } from '../helpers/useMouseGravity';
import { GRAVITY_TRANSFORM_PREFIX, useMouseGravity } from '../helpers/useMouseGravity';
import type { SxObject } from '../theme';
import { GlassContainer, type GlassContainerProps } from './GlassContainer';

interface MouseAwareGlassContainerProps extends GlassContainerProps {
  /** Configuration for the mouse gravity effect */
  gravity?: UseMouseGravityOptions;
}

/**
 * Composes the gravity CSS variable into the transform chain.
 * If the consumer already has a `transform` in their sx, the gravity
 * prefix is prepended so both transforms apply. Otherwise the gravity
 * variable is the sole transform.
 */
function composeGravitySx(sx?: SxObject): SxObject {
  const existing =
    sx && 'transform' in sx && typeof sx.transform === 'string' ? sx.transform : undefined;
  return {
    ...sx,
    transform: existing ? `${GRAVITY_TRANSFORM_PREFIX} ${existing}` : GRAVITY_TRANSFORM_PREFIX,
  };
}

/**
 * A GlassContainer with a "mouse gravity" effect. The container subtly
 * tilts toward the cursor via perspective rotation and stretches along
 * the dominant axis, creating a physical, tactile feel.
 *
 * Uses a CSS custom property (`--gx-transform`) so the gravity effect
 * **composes** with any existing `transform` in the `sx` prop rather
 * than replacing it.
 *
 * Drop-in replacement for GlassContainer — accepts all the same props plus
 * optional `gravity` configuration.
 */
export function MouseAwareGlassContainer({
  children,
  gravity,
  sx,
  ...props
}: MouseAwareGlassContainerProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasNoHover = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(hasTouchPoints || hasCoarsePointer || hasNoHover);
  }, []);

  const { ref } = useMouseGravity({
    ...gravity,
    enabled: gravity?.enabled ?? !isTouchDevice,
  });
  return (
    <GlassContainer ref={ref} sx={composeGravitySx(sx)} {...props}>
      {children}
    </GlassContainer>
  );
}
