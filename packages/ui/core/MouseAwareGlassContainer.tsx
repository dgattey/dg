'use client';

import type { ComponentPropsWithoutRef } from 'react';
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
export function MouseAwareGlassContainer<ContainerOverrideType extends React.ElementType>({
  children,
  gravity,
  sx,
  component: ContainerOverride = GlassContainer,
  ...props
}: MouseAwareGlassContainerProps & ComponentPropsWithoutRef<ContainerOverrideType>) {
  const { ref } = useMouseGravity(gravity);
  return (
    <ContainerOverride ref={ref} sx={{ ...composeGravitySx(sx), ...sx }} {...props}>
      {children}
    </ContainerOverride>
  );
}
