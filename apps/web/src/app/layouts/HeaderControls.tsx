'use client';

import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { useState } from 'react';
import { MusicHeaderMenu } from './MusicHeaderMenu';

type OpenControl = 'music' | 'theme' | null;

/**
 * Sibling header disclosures on one shared glass capsule. Music sits left and
 * theme right; both panels open down and left from their own trigger. Only one
 * can be open, so their surfaces never collide.
 */
export function HeaderControls() {
  const [openControl, setOpenControl] = useState<OpenControl>(null);

  const handleThemeOpenChange = (isOpen: boolean) => {
    setOpenControl((current) => (isOpen ? 'theme' : current === 'theme' ? null : current));
  };

  const handleMusicOpenChange = (isOpen: boolean) => {
    setOpenControl((current) => (isOpen ? 'music' : current === 'music' ? null : current));
  };

  return (
    <MouseAwareGlassContainer
      data-header-controls={true}
      gravity={{ maxTilt: 1.5, radius: 180 }}
      sx={{ alignItems: 'center', display: 'flex', gap: 0.5, p: 1 }}
    >
      <MusicHeaderMenu isOpen={openControl === 'music'} onOpenChange={handleMusicOpenChange} />
      <ColorSchemeToggleClient
        embedded
        isOpen={openControl === 'theme'}
        onOpenChange={handleThemeOpenChange}
      />
    </MouseAwareGlassContainer>
  );
}
