import 'server-only';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { GreenhousePlantFrame } from './GreenhousePlantFrame';
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

/**
 * Shared greenhouse shell. Tokens (display serif, matte glass) always apply.
 * Atmosphere and plants are optional so other routes can wrap later with the
 * same vocabulary.
 */
export function GreenhouseFrame({ children, surface, chrome = true }: GreenhouseFrameProps) {
  const plants = chrome ? layoutGreenhousePlants(surface) : [];
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
              <div className={styles.canopy} />
              <div className={styles.ribs} />
              <div className={styles.shaft} />
              <div className={styles.panes} />
              <div className={styles.dapple} />
              <div className={styles.dew} />
              <div className={styles.sun} />
              <div className={styles.sunBlob} />
              <div className={styles.mullions}>
                <span className={styles.mullionV} style={{ left: '0%' }} />
                <span className={styles.mullionV} style={{ left: '20%' }} />
                <span className={styles.mullionV} style={{ left: '40%' }} />
                <span className={styles.mullionV} style={{ left: '60%' }} />
                <span className={styles.mullionV} style={{ left: '80%' }} />
                <span className={styles.mullionV} style={{ left: 'calc(100% - 7px)' }} />
                <span className={styles.mullionH} style={{ top: '0%' }} />
                <span className={styles.mullionH} style={{ top: '16%' }} />
                <span className={styles.mullionH} style={{ top: '38%' }} />
                <span className={styles.mullionH} style={{ top: '68%' }} />
                <span className={styles.mullionH} style={{ bottom: '0%' }} />
              </div>
            </div>
            <GreenhousePlants layer="back" plants={plants} />
          </div>
          <div className={styles.frontStack}>
            {surface === 'home' ? <GreenhousePlantFrame /> : null}
            <GreenhousePlants layer="front" plants={plants} />
          </div>
        </>
      ) : null}
      <div className={styles.content}>{children}</div>
    </Box>
  );
}
