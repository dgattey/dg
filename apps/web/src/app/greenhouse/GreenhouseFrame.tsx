import 'server-only';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import depthPlateAvif from './atmosphere/depth-plate.avif';
import depthPlateWebp from './atmosphere/depth-plate.webp';
import { GreenhousePlants } from './GreenhousePlants';
import styles from './greenhouse.module.css';
import type { GreenhouseSurface } from './greenhouseLayout';
import { layoutGreenhousePlants } from './greenhouseLayout';
import { GREENHOUSE_FRAME_VARS } from './greenhousePalette';

type GreenhouseFrameProps = {
  children: ReactNode;
  surface: GreenhouseSurface;
  /**
   * Decorative ribs, sun, and plants. Token overrides still apply when this
   * is off so the design-system pass can be photographed on its own.
   */
  chrome?: boolean;
};

const src = (asset: { src: string }) => asset.src;

const MULLION_V = ['edgeL', 'contentL', 'center', 'contentR', 'edgeR'] as const;
const MULLION_H = ['edgeT', 'third', 'gutter', 'edgeB'] as const;

/**
 * Shared greenhouse shell. Tokens (display serif, matte glass) always apply.
 * Atmosphere and plants are optional so other routes can wrap later with the
 * same vocabulary.
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
              <picture className={styles.depthPlate}>
                <source srcSet={src(depthPlateAvif)} type="image/avif" />
                <img
                  alt=""
                  decoding="async"
                  draggable={false}
                  height={depthPlateWebp.height}
                  src={src(depthPlateWebp)}
                  width={depthPlateWebp.width}
                />
              </picture>
              <div className={styles.behindGlass} />
              <div className={styles.canopy} />
              <div className={styles.ribs} />
              <div className={styles.shaft} />
              <div className={styles.panes} />
              <div className={styles.dapple} />
              <div className={styles.dew} />
              <div className={styles.sun} />
              <div className={styles.sunBlob} />
              <div className={styles.mullions}>
                {MULLION_V.map((slot) => (
                  <span className={styles.mullionV} data-slot={slot} key={`v-${slot}`} />
                ))}
                {MULLION_H.map((slot) => (
                  <span className={styles.mullionH} data-slot={slot} key={`h-${slot}`} />
                ))}
              </div>
            </div>
            <GreenhousePlants layer="back" plants={desktopPlants} viewport="desktop" />
            <GreenhousePlants layer="back" plants={mobilePlants} viewport="mobile" />
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
