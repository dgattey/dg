'use client';

import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { Box } from '@mui/material';
import { useState } from 'react';
import { MusicHeaderMenu } from './MusicHeaderMenu';

type OpenControl = 'music' | 'theme' | null;

/**
 * Sibling header disclosures. Theme sits left because its panel grows left;
 * music sits at the viewport edge and opens its menu down and left. Only one
 * can be open, so their glass surfaces never collide.
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
    <Box sx={{ alignItems: 'start', display: 'flex', gap: 1 }}>
      <ColorSchemeToggleClient
        isOpen={openControl === 'theme'}
        onOpenChange={handleThemeOpenChange}
      />
      <MusicHeaderMenu isOpen={openControl === 'music'} onOpenChange={handleMusicOpenChange} />
    </Box>
  );
}
