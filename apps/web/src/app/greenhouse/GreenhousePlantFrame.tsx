import frame from './foliage/home-frame.webp';
import styles from './greenhouse.module.css';

/**
 * One photographic plant layer at inspo native size (1536×1024). Alpha is a
 * foliage mask plus copy wells — not left/right/bottom strips and not
 * card-shaped punches. CSS sizes it with object-fit: cover so it is never
 * stretched past a display-sized source.
 */
export function GreenhousePlantFrame() {
  return (
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
  );
}
