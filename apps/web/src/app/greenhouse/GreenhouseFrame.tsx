import 'server-only';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { GreenhouseBackPlate, GreenhouseFoliage } from './GreenhouseFoliage';
import { GreenhousePlants } from './GreenhousePlants';
import styles from './greenhouse.module.css';
import type { GreenhouseSurface } from './greenhouseLayout';
import { layoutGreenhousePlants } from './greenhouseLayout';
import { GREENHOUSE_FRAME_VARS } from './greenhousePalette';

type GreenhouseFrameProps = {
  children: ReactNode;
  surface: GreenhouseSurface;
  /**
   * Plate, edge strips, bottom band, and corner cutouts. Token overrides
   * still apply when this is off so the design-system pass can be photographed
   * on its own.
   */
  chrome?: boolean;
};

/**
 * Shared greenhouse shell. `surface` selects the plant layout (`home` vs
 * `music`). Tokens always apply; chrome is optional so other routes can wrap
 * later with the same vocabulary.
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
        <>
          <div className={styles.backStack}>
            <div className={styles.atmosphere}>
              <GreenhouseBackPlate />
              <div className={styles.plateTint} />
              <div className={styles.ribs} />
              <div className={styles.sun} />
            </div>
            <GreenhouseFoliage />
          </div>
          <div className={styles.frontStack}>
            <GreenhousePlants layer="front" plants={desktopPlants} viewport="desktop" />
            <GreenhousePlants layer="front" plants={mobilePlants} viewport="mobile" />
          </div>
        </>
      ) : null}
      <div className={styles.content}>{children}</div>
    </Box>
  );
}
