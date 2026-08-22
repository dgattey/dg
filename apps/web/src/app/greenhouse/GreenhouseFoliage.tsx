import plate960Avif from './atmosphere/back-plate-960.avif';
import plate960Webp from './atmosphere/back-plate-960.webp';
import plate1536Avif from './atmosphere/back-plate-1536.avif';
import plate1536Webp from './atmosphere/back-plate-1536.webp';
import platePortraitAvif from './atmosphere/back-plate-portrait.avif';
import platePortraitWebp from './atmosphere/back-plate-portrait.webp';
import bottomBand1024Avif from './foliage/bottom-band-1024.avif';
import bottomBand1024Webp from './foliage/bottom-band-1024.webp';
import bottomBand1536Avif from './foliage/bottom-band-1536.avif';
import bottomBand1536Webp from './foliage/bottom-band-1536.webp';
import edgeLeft900Avif from './foliage/edge-left-900.avif';
import edgeLeft900Webp from './foliage/edge-left-900.webp';
import edgeLeft1536Avif from './foliage/edge-left-1536.avif';
import edgeLeft1536Webp from './foliage/edge-left-1536.webp';
import edgeRight900Avif from './foliage/edge-right-900.avif';
import edgeRight900Webp from './foliage/edge-right-900.webp';
import edgeRight1536Avif from './foliage/edge-right-1536.avif';
import edgeRight1536Webp from './foliage/edge-right-1536.webp';
import styles from './greenhouse.module.css';

const src = (asset: { src: string }) => asset.src;

type EdgeSide = 'left' | 'right';

const EDGES: Record<
  EdgeSide,
  {
    desktopAvif: string;
    desktopWebp: string;
    height: number;
    mobileAvif: string;
    mobileWebp: string;
    width: number;
  }
> = {
  left: {
    desktopAvif: src(edgeLeft1536Avif),
    desktopWebp: src(edgeLeft1536Webp),
    height: edgeLeft1536Webp.height,
    mobileAvif: src(edgeLeft900Avif),
    mobileWebp: src(edgeLeft900Webp),
    width: edgeLeft1536Webp.width,
  },
  right: {
    desktopAvif: src(edgeRight1536Avif),
    desktopWebp: src(edgeRight1536Webp),
    height: edgeRight1536Webp.height,
    mobileAvif: src(edgeRight900Avif),
    mobileWebp: src(edgeRight900Webp),
    width: edgeRight1536Webp.width,
  },
};

function imageSet(avif: { src: string }, webp: { src: string }): string {
  return `image-set(url("${src(avif)}") type("image/avif"), url("${src(webp)}") type("image/webp"))`;
}

/**
 * Photographic back plate. Portrait glass on phones; landscape otherwise.
 */
export function GreenhouseBackPlate() {
  return (
    <picture className={styles.backPlate}>
      <source media="(max-width: 767px)" srcSet={src(platePortraitAvif)} type="image/avif" />
      <source media="(max-width: 767px)" srcSet={src(platePortraitWebp)} type="image/webp" />
      <source media="(min-width: 1024px)" srcSet={src(plate1536Avif)} type="image/avif" />
      <source media="(min-width: 1024px)" srcSet={src(plate1536Webp)} type="image/webp" />
      <source srcSet={src(plate960Avif)} type="image/avif" />
      <source srcSet={src(plate960Webp)} type="image/webp" />
      <img
        alt=""
        decoding="async"
        draggable={false}
        fetchPriority="high"
        height={plate1536Webp.height}
        src={src(plate1536Webp)}
        width={plate1536Webp.width}
      />
    </picture>
  );
}

function GreenhouseEdge({ side }: { side: EdgeSide }) {
  const asset = EDGES[side];
  return (
    <picture className={side === 'left' ? styles.edgeLeft : styles.edgeRight}>
      <source media="(max-width: 575px)" srcSet={asset.mobileAvif} type="image/avif" />
      <source media="(max-width: 575px)" srcSet={asset.mobileWebp} type="image/webp" />
      <source srcSet={asset.desktopAvif} type="image/avif" />
      <img
        alt=""
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={asset.height}
        src={asset.desktopWebp}
        width={asset.width}
      />
    </picture>
  );
}

export function GreenhouseBottomBand() {
  return (
    <>
      <div
        aria-hidden="true"
        className={`${styles.bottomBand} ${styles.bottomBandDesktop}`}
        style={{ backgroundImage: imageSet(bottomBand1536Avif, bottomBand1536Webp) }}
      />
      <div
        aria-hidden="true"
        className={`${styles.bottomBand} ${styles.bottomBandMobile}`}
        style={{ backgroundImage: imageSet(bottomBand1024Avif, bottomBand1024Webp) }}
      />
    </>
  );
}

/**
 * Independently anchored foliage: left strip, right strip, tiled bottom band.
 */
export function GreenhouseFoliage() {
  return (
    <>
      <GreenhouseEdge side="left" />
      <GreenhouseEdge side="right" />
      <GreenhouseBottomBand />
    </>
  );
}
