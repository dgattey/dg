import bottom from './foliage/frame-bottom.webp';
import left from './foliage/frame-left.webp';
import right from './foliage/frame-right.webp';
import styles from './greenhouse.module.css';

/**
 * Photographic plant frame for the homepage. Cut from the conservatory
 * reference so species and overlap match the inspo, with copy punched out.
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
