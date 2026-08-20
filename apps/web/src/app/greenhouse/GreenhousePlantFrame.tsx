import bottom from './foliage/frame-bottom.webp';
import left from './foliage/frame-left.webp';
import right from './foliage/frame-right.webp';
import styles from './greenhouse.module.css';

/**
 * Home plant layer from the conservatory photo, as viewport strips at
 * display size (≈374×960 / 1440×308). Not 200px sources stretched to fill.
 */
export function GreenhousePlantFrame() {
  return (
    <div aria-hidden="true" className={styles.plantFrame}>
      <img
        alt=""
        aria-hidden="true"
        className={styles.frameLeft}
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={left.height}
        src={left.src}
        width={left.width}
      />
      <img
        alt=""
        aria-hidden="true"
        className={styles.frameRight}
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={right.height}
        src={right.src}
        width={right.width}
      />
      <img
        alt=""
        aria-hidden="true"
        className={styles.frameBottom}
        decoding="async"
        draggable={false}
        fetchPriority="low"
        height={bottom.height}
        src={bottom.src}
        width={bottom.width}
      />
    </div>
  );
}
