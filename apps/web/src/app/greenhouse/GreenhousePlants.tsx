import type { CSSProperties } from 'react';
import bop from './foliage/bop.webp';
import calathea from './foliage/calathea.webp';
import monstera from './foliage/monstera.webp';
import nerve from './foliage/nerve.webp';
import styles from './greenhouse.module.css';
import type { LeafSymbol, PlantInstance, PlantLayer } from './greenhouseLayout';

type GreenhousePlantsProps = {
  plants: ReadonlyArray<PlantInstance>;
  layer: PlantLayer;
};

const FOLIAGE = {
  'leaf-bop': bop,
  'leaf-calathea': calathea,
  'leaf-monstera': monstera,
  'leaf-nerve': nerve,
  'leaf-pothos': nerve,
  'leaf-prayer': nerve,
  'leaf-zz': calathea,
} as const satisfies Record<LeafSymbol, typeof monstera>;

/**
 * Decorative painterly foliage. Clicks pass through; screen readers skip it.
 * Sprites are tiny WebP clusters, not LCP photographs and not clip-art SVG.
 */
export function GreenhousePlants({ plants, layer }: GreenhousePlantsProps) {
  const items = plants.filter((plant) => plant.layer === layer);
  return (
    <div aria-hidden="true" className={layer === 'back' ? styles.plantsBack : styles.plantsFront}>
      {items.map((plant) => {
        const asset = FOLIAGE[plant.symbol];
        const mass = plant.featured ? 40 : 30;
        const inset = `${plant.x}%`;
        return (
          <img
            alt=""
            aria-hidden="true"
            className={styles.plant}
            data-cluster={plant.cluster}
            data-featured={plant.featured ? 'true' : undefined}
            decoding="async"
            draggable={false}
            fetchPriority="low"
            height={asset.height}
            key={plant.id}
            src={asset.src}
            style={
              {
                '--plant-width': `${plant.scale * mass}vmin`,
                left: plant.edge === 'left' ? inset : 'auto',
                right: plant.edge === 'right' ? inset : 'auto',
                top: `${plant.y}%`,
                transform: `rotate(${plant.rotate}deg)`,
              } as CSSProperties
            }
            width={asset.width}
          />
        );
      })}
    </div>
  );
}
