import type { CSSProperties } from 'react';
import bop768Avif from './foliage/bop-768.avif';
import bop768Webp from './foliage/bop-768.webp';
import bop1024Avif from './foliage/bop-1024.avif';
import bop1024Webp from './foliage/bop-1024.webp';
import calathea768Avif from './foliage/calathea-768.avif';
import calathea768Webp from './foliage/calathea-768.webp';
import calathea1024Avif from './foliage/calathea-1024.avif';
import calathea1024Webp from './foliage/calathea-1024.webp';
import monstera768Avif from './foliage/monstera-768.avif';
import monstera768Webp from './foliage/monstera-768.webp';
import monstera1024Avif from './foliage/monstera-1024.avif';
import monstera1024Webp from './foliage/monstera-1024.webp';
import nerve768Avif from './foliage/nerve-768.avif';
import nerve768Webp from './foliage/nerve-768.webp';
import nerve1024Avif from './foliage/nerve-1024.avif';
import nerve1024Webp from './foliage/nerve-1024.webp';
import styles from './greenhouse.module.css';
import { plantMassVmin } from './greenhouseGeometry';
import type { GreenhouseViewport, LeafSymbol, PlantInstance, PlantLayer } from './greenhouseLayout';

type PlantMount = 'side' | 'bottom';

type GreenhousePlantsProps = {
  plants: ReadonlyArray<PlantInstance>;
  layer: PlantLayer;
  mount?: PlantMount;
  viewport?: GreenhouseViewport;
};

type FoliageSet = {
  desktopAvif: string;
  desktopWebp: string;
  mobileAvif: string;
  mobileWebp: string;
  width: number;
  height: number;
};

const src = (asset: { src: string; width: number; height: number }) => asset;

const FOLIAGE: Partial<Record<LeafSymbol, FoliageSet>> = {
  'leaf-bop': {
    desktopAvif: src(bop1024Avif).src,
    desktopWebp: src(bop1024Webp).src,
    height: bop1024Webp.height,
    mobileAvif: src(bop768Avif).src,
    mobileWebp: src(bop768Webp).src,
    width: bop1024Webp.width,
  },
  'leaf-calathea': {
    desktopAvif: src(calathea1024Avif).src,
    desktopWebp: src(calathea1024Webp).src,
    height: calathea1024Webp.height,
    mobileAvif: src(calathea768Avif).src,
    mobileWebp: src(calathea768Webp).src,
    width: calathea1024Webp.width,
  },
  'leaf-monstera': {
    desktopAvif: src(monstera1024Avif).src,
    desktopWebp: src(monstera1024Webp).src,
    height: monstera1024Webp.height,
    mobileAvif: src(monstera768Avif).src,
    mobileWebp: src(monstera768Webp).src,
    width: monstera1024Webp.width,
  },
  'leaf-nerve': {
    desktopAvif: src(nerve1024Avif).src,
    desktopWebp: src(nerve1024Webp).src,
    height: nerve1024Webp.height,
    mobileAvif: src(nerve768Avif).src,
    mobileWebp: src(nerve768Webp).src,
    width: nerve1024Webp.width,
  },
};

function plantPosition(plant: PlantInstance): CSSProperties {
  const inset = `${plant.x}%`;
  if (plant.edge === 'bottom') {
    return {
      bottom: `${plant.y}%`,
      left: inset,
      right: 'auto',
      top: 'auto',
    };
  }
  return {
    left: plant.edge === 'left' ? inset : 'auto',
    right: plant.edge === 'right' ? inset : 'auto',
    top: `${plant.y}%`,
  };
}

/**
 * Photoreal cutouts. Clicks pass through; screen readers skip them.
 * AVIF is the transfer; WebP is the fallback. Mobile uses the 768w encode.
 */
function matchesMount(plant: PlantInstance, mount: PlantMount): boolean {
  return mount === 'bottom' ? plant.edge === 'bottom' : plant.edge !== 'bottom';
}

export function GreenhousePlants({
  plants,
  layer,
  mount = 'bottom',
  viewport = 'desktop',
}: GreenhousePlantsProps) {
  const items = plants.filter(
    (plant) => plant.layer === layer && matchesMount(plant, mount) && FOLIAGE[plant.symbol],
  );
  return (
    <div
      aria-hidden="true"
      className={layer === 'back' ? styles.plantsBack : styles.plantsFront}
      data-viewport={viewport}
    >
      {items.map((plant) => {
        const asset = FOLIAGE[plant.symbol];
        if (!asset) {
          return null;
        }
        const mass = plantMassVmin(plant);
        return (
          <picture
            className={styles.plant}
            data-cluster={plant.cluster}
            data-edge={plant.edge}
            data-featured={plant.featured ? 'true' : undefined}
            data-min-width={plant.minWidth != null ? 'wide' : undefined}
            key={plant.id}
            style={
              {
                '--plant-enter-x':
                  plant.edge === 'right' ? '12vw' : plant.edge === 'bottom' ? '0px' : '-12vw',
                '--plant-enter-y': plant.edge === 'bottom' ? '10vh' : '4vh',
                '--plant-flip': plant.flip ? -1 : 1,
                '--plant-rotate': `${plant.rotate}deg`,
                '--plant-width': `${plant.scale * mass}vmin`,
                '--plant-z': plant.z ?? 0,
                maxWidth: `${asset.width}px`,
                ...plantPosition(plant),
              } as CSSProperties
            }
          >
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
      })}
    </div>
  );
}
