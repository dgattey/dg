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
import styles from './greenhouse.module.css';

const src = (asset: { src: string }) => asset.src;

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
