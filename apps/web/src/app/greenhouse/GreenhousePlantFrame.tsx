import frame from './foliage/home-frame.webp';
import frameMobile from './foliage/home-frame-mobile.webp';
import styles from './greenhouse.module.css';

/**
 * Photographic plant layer. Desktop uses the landscape frame at inspo native
 * size (1536×1024). Mobile uses a portrait frame so side thickets stay in
 * frame — a landscape `object-fit: cover` crop was throwing them away.
 * Alpha is foliage plus copy wells, not card-shaped punches.
 */
export function GreenhousePlantFrame() {
  return (
    <>
      <img
        alt=""
        aria-hidden="true"
        className={styles.homeFrame}
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={frame.height}
        src={frame.src}
        width={frame.width}
      />
      <img
        alt=""
        aria-hidden="true"
        className={styles.homeFrameMobile}
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={frameMobile.height}
        src={frameMobile.src}
        width={frameMobile.width}
      />
    </>
  );
}
