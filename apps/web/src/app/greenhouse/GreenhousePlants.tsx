import styles from './greenhouse.module.css';
import type { PlantInstance, PlantLayer } from './greenhouseLayout';

type GreenhousePlantsProps = {
  plants: ReadonlyArray<PlantInstance>;
  layer: PlantLayer;
};

/**
 * Decorative SVG overlay. Clicks pass through; screen readers skip it.
 */
export function GreenhousePlants({ plants, layer }: GreenhousePlantsProps) {
  const items = plants.filter((plant) => plant.layer === layer);
  return (
    <svg
      aria-hidden="true"
      className={layer === 'back' ? styles.plantsBack : styles.plantsFront}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {items.map((plant) => (
        <use
          data-cluster={plant.cluster}
          data-featured={plant.featured ? 'true' : undefined}
          height={plant.scale * 18}
          href={`#${plant.symbol}`}
          key={plant.id}
          transform={`rotate(${plant.rotate} ${plant.x + plant.scale * 9} ${plant.y + plant.scale * 9})`}
          width={plant.scale * 18}
          x={plant.x}
          y={plant.y}
        />
      ))}
    </svg>
  );
}
