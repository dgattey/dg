import 'server-only';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { GreenhouseBackPlate } from './GreenhouseFoliage';
import { GreenhousePlants } from './GreenhousePlants';
import styles from './greenhouse.module.css';
import type { GreenhouseSurface } from './greenhouseLayout';
import { layoutGreenhousePlants } from './greenhouseLayout';
import { GREENHOUSE_FRAME_VARS } from './greenhousePalette';

type GreenhouseFrameProps = {
  children: ReactNode;
  surface: GreenhouseSurface;
  /**
   * Plate and cutout foliage. Token overrides still apply when this is off
   * so the design-system pass can be photographed on its own.
   */
  chrome?: boolean;
};

/**
 * Shared greenhouse shell. `surface` selects the plant layout (`home` vs
 * `music`). Stack is plate → in-document sides → cards → fixed bottom fringe.
 * The site header lives outside this frame at a higher z-index.
 */
export function GreenhouseFrame({ children, surface, chrome = true }: GreenhouseFrameProps) {
  const desktopPlants = chrome ? layoutGreenhousePlants(surface, 0, 'desktop') : [];
  const mobilePlants = chrome ? layoutGreenhousePlants(surface, 0, 'mobile') : [];
  return (
    <Box
      className={styles.frame}
      data-greenhouse-chrome={chrome ? 'on' : 'off'}
      data-greenhouse-frame={true}
      data-greenhouse-surface={surface}
      sx={GREENHOUSE_FRAME_VARS}
    >
      {chrome ? (
        <div className={styles.backStack} data-greenhouse-layer="plate">
          <GreenhouseBackPlate />
        </div>
      ) : null}
      {chrome ? (
        <div aria-hidden="true" className={styles.sideStack} data-greenhouse-layer="sides">
          <GreenhousePlants layer="back" mount="side" plants={desktopPlants} viewport="desktop" />
          <GreenhousePlants layer="back" mount="side" plants={mobilePlants} viewport="mobile" />
          <GreenhousePlants layer="front" mount="side" plants={desktopPlants} viewport="desktop" />
          <GreenhousePlants layer="front" mount="side" plants={mobilePlants} viewport="mobile" />
        </div>
      ) : null}
      <div className={styles.content} data-greenhouse-layer="cards">
        {children}
      </div>
      {chrome ? (
        <div aria-hidden="true" className={styles.bottomStack} data-greenhouse-layer="plants">
          <GreenhousePlants layer="back" mount="bottom" plants={desktopPlants} viewport="desktop" />
          <GreenhousePlants layer="back" mount="bottom" plants={mobilePlants} viewport="mobile" />
          <GreenhousePlants
            layer="front"
            mount="bottom"
            plants={desktopPlants}
            viewport="desktop"
          />
          <GreenhousePlants layer="front" mount="bottom" plants={mobilePlants} viewport="mobile" />
        </div>
      ) : null}
    </Box>
  );
}
