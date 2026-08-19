import { LEAF_VIEWBOXES } from './GreenhouseSpriteDefs';
import styles from './greenhouse.module.css';
import type { LeafSymbol, PlantInstance, PlantLayer } from './greenhouseLayout';

type GreenhousePlantsProps = {
  plants: ReadonlyArray<PlantInstance>;
  layer: PlantLayer;
};

const aspectWidth = (symbol: LeafSymbol, scale: number, featured: boolean): string => {
  const box = LEAF_VIEWBOXES[symbol];
  const [, , width, height] = box.split(' ').map(Number);
  const ratio = (width ?? 100) / (height ?? 100);
  const mass = featured ? 34 : 22;
  return `${scale * mass * Math.min(1.15, ratio + 0.15)}vmin`;
};

/**
 * Decorative SVG overlay. Each leaf keeps its authored aspect ratio — stretching
 * is banned. Clicks pass through; screen readers skip it.
 */
export function GreenhousePlants({ plants, layer }: GreenhousePlantsProps) {
  const items = plants.filter((plant) => plant.layer === layer);
  return (
    <div aria-hidden="true" className={layer === 'back' ? styles.plantsBack : styles.plantsFront}>
      {items.map((plant) => (
        <svg
          aria-hidden="true"
          className={styles.plant}
          data-cluster={plant.cluster}
          data-featured={plant.featured ? 'true' : undefined}
          focusable="false"
          key={plant.id}
          preserveAspectRatio="xMidYMid meet"
          style={{
            left: `${plant.x}%`,
            top: `${plant.y}%`,
            transform: `rotate(${plant.rotate}deg)`,
            width: aspectWidth(plant.symbol, plant.scale, plant.featured),
          }}
          viewBox={LEAF_VIEWBOXES[plant.symbol]}
        >
          <use href={`#${plant.symbol}`} />
        </svg>
      ))}
    </div>
  );
}
