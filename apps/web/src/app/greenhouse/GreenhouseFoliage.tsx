import plate768Avif from './atmosphere/back-plate-768.avif';
import plate768Webp from './atmosphere/back-plate-768.webp';
import plate960Avif from './atmosphere/back-plate-960.avif';
import plate960Webp from './atmosphere/back-plate-960.webp';
import plate1536Avif from './atmosphere/back-plate-1536.avif';
import plate1536Webp from './atmosphere/back-plate-1536.webp';
import platePortraitAvif from './atmosphere/back-plate-portrait.avif';
import platePortraitWebp from './atmosphere/back-plate-portrait.webp';
import platePortrait768Avif from './atmosphere/back-plate-portrait-768.avif';
import platePortrait768Webp from './atmosphere/back-plate-portrait-768.webp';
import bottomBand768Avif from './foliage/bottom-band-768.avif';
import bottomBand768Webp from './foliage/bottom-band-768.webp';
import bottomBand1024Avif from './foliage/bottom-band-1024.avif';
import bottomBand1024Webp from './foliage/bottom-band-1024.webp';
import bottomBand1536Avif from './foliage/bottom-band-1536.avif';
import bottomBand1536Webp from './foliage/bottom-band-1536.webp';
import edgeLeft768Avif from './foliage/edge-left-768.avif';
import edgeLeft768Webp from './foliage/edge-left-768.webp';
import edgeLeft900Avif from './foliage/edge-left-900.avif';
import edgeLeft900Webp from './foliage/edge-left-900.webp';
import edgeLeft1536Avif from './foliage/edge-left-1536.avif';
import edgeLeft1536Webp from './foliage/edge-left-1536.webp';
import edgeRight768Avif from './foliage/edge-right-768.avif';
import edgeRight768Webp from './foliage/edge-right-768.webp';
import edgeRight900Avif from './foliage/edge-right-900.avif';
import edgeRight900Webp from './foliage/edge-right-900.webp';
import edgeRight1536Avif from './foliage/edge-right-1536.avif';
import edgeRight1536Webp from './foliage/edge-right-1536.webp';
import styles from './greenhouse.module.css';

const src = (asset: { src: string }) => asset.src;

type DensitySet = {
  x1Avif: string;
  x1Webp: string;
  x2Avif: string;
  x2Webp: string;
};

type EdgeSide = 'left' | 'right';

const EDGES: Record<
  EdgeSide,
  DensitySet & {
    height: number;
    width: number;
  }
> = {
  left: {
    height: edgeLeft1536Webp.height,
    width: edgeLeft1536Webp.width,
    x1Avif: src(edgeLeft768Avif),
    x1Webp: src(edgeLeft768Webp),
    x2Avif: src(edgeLeft1536Avif),
    x2Webp: src(edgeLeft1536Webp),
  },
  right: {
    height: edgeRight1536Webp.height,
    width: edgeRight1536Webp.width,
    x1Avif: src(edgeRight768Avif),
    x1Webp: src(edgeRight768Webp),
    x2Avif: src(edgeRight1536Avif),
    x2Webp: src(edgeRight1536Webp),
  },
};

const EDGE_SIZES =
  '(max-width: 575px) calc((16px + 16px) / 0.8), calc((clamp(180px, 20vw, 440px) + 56px) / 0.8)';

function srcSet(x1: string, x2: string, mid?: { src: string; w: number }): string {
  return mid ? `${x1} 768w, ${mid.src} ${mid.w}w, ${x2} 1536w` : `${x1} 1x, ${x2} 2x`;
}

function imageSet(
  avif: { src: string },
  webp: { src: string },
  avif2x: { src: string },
  webp2x: { src: string },
): string {
  return `image-set(url("${src(avif)}") type("image/avif") 1x, url("${src(avif2x)}") type("image/avif") 2x, url("${src(webp)}") type("image/webp") 1x, url("${src(webp2x)}") type("image/webp") 2x)`;
}

/**
 * Photographic back plate. Portrait glass on phones; landscape otherwise.
 * 768/960 are 1× candidates; 1536 is the native source cap (2× of ~768 CSS).
 */
export function GreenhouseBackPlate() {
  const landscapeAvif = `${src(plate768Avif)} 768w, ${src(plate960Avif)} 960w, ${src(plate1536Avif)} 1536w`;
  const landscapeWebp = `${src(plate768Webp)} 768w, ${src(plate960Webp)} 960w, ${src(plate1536Webp)} 1536w`;
  const portraitAvif = `${src(platePortrait768Avif)} 768w, ${src(platePortraitAvif)} 1024w`;
  const portraitWebp = `${src(platePortrait768Webp)} 768w, ${src(platePortraitWebp)} 1024w`;
  return (
    <picture className={styles.backPlate}>
      <source media="(max-width: 767px)" sizes="100vw" srcSet={portraitAvif} type="image/avif" />
      <source media="(max-width: 767px)" sizes="100vw" srcSet={portraitWebp} type="image/webp" />
      <source sizes="100vw" srcSet={landscapeAvif} type="image/avif" />
      <source sizes="100vw" srcSet={landscapeWebp} type="image/webp" />
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
  const mid =
    side === 'left'
      ? { src: src(edgeLeft900Avif), w: 600 }
      : { src: src(edgeRight900Avif), w: 600 };
  const midWebp =
    side === 'left'
      ? { src: src(edgeLeft900Webp), w: 600 }
      : { src: src(edgeRight900Webp), w: 600 };
  return (
    <picture className={side === 'left' ? styles.edgeLeft : styles.edgeRight}>
      <source
        sizes={EDGE_SIZES}
        srcSet={srcSet(asset.x1Avif, asset.x2Avif, mid)}
        type="image/avif"
      />
      <source
        sizes={EDGE_SIZES}
        srcSet={srcSet(asset.x1Webp, asset.x2Webp, midWebp)}
        type="image/webp"
      />
      <img
        alt=""
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={asset.height}
        src={asset.x2Webp}
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
        style={{
          backgroundImage: imageSet(
            bottomBand768Avif,
            bottomBand768Webp,
            bottomBand1536Avif,
            bottomBand1536Webp,
          ),
        }}
      />
      <div
        aria-hidden="true"
        className={`${styles.bottomBand} ${styles.bottomBandMobile}`}
        style={{
          backgroundImage: imageSet(
            bottomBand768Avif,
            bottomBand768Webp,
            bottomBand1024Avif,
            bottomBand1024Webp,
          ),
        }}
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
