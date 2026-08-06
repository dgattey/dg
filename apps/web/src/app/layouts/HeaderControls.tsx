'use client';

import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import { GRAVITY_TRANSFORM_PREFIX, useMouseGravity } from '@dg/ui/helpers/useMouseGravity';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useState } from 'react';
import { MusicHeaderMenu } from './MusicHeaderMenu';

type OpenControl = 'music' | 'theme' | null;

const CAPSULE_GRAVITY = { maxTilt: 1.5, radius: 180 };

/**
 * Lays the two triggers out in a row and tilts the whole cluster — glass, both
 * triggers, and whichever panel is open — toward the cursor as one object.
 */
const capsuleSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  gap: 0.5,
  p: 1,
  position: 'relative',
  transform: GRAVITY_TRANSFORM_PREFIX,
};

/**
 * The glass sits *behind* the triggers as a sibling instead of wrapping them.
 *
 * `backdrop-filter` makes an element the backdrop root for its entire subtree, so
 * a panel nested inside the capsule blurs the capsule rather than the page — and
 * because the panel hangs below the capsule's box there is nothing of the capsule
 * under it to sample, which paints it fully transparent. Keeping the glass a
 * sibling leaves the page as each panel's backdrop root while the capsule still
 * reads as one continuous surface.
 */
const capsuleGlassSx: SxObject = {
  inset: 0,
  position: 'absolute',
};

/**
 * Sibling header disclosures on one shared glass capsule. Music sits left and
 * theme right; both panels open down and left from their own trigger. Only one
 * can be open, so their surfaces never collide.
 */
export function HeaderControls() {
  const [openControl, setOpenControl] = useState<OpenControl>(null);
  const { ref } = useMouseGravity(CAPSULE_GRAVITY);

  const handleThemeOpenChange = (isOpen: boolean) => {
    setOpenControl((current) => (isOpen ? 'theme' : current === 'theme' ? null : current));
  };

  const handleMusicOpenChange = (isOpen: boolean) => {
    setOpenControl((current) => (isOpen ? 'music' : current === 'music' ? null : current));
  };

  return (
    <Box data-header-controls={true} ref={ref} sx={capsuleSx}>
      <GlassContainer aria-hidden={true} data-capsule-glass={true} sx={capsuleGlassSx} />
      <MusicHeaderMenu isOpen={openControl === 'music'} onOpenChange={handleMusicOpenChange} />
      <ColorSchemeToggleClient
        embedded
        isOpen={openControl === 'theme'}
        onOpenChange={handleThemeOpenChange}
      />
    </Box>
  );
}
