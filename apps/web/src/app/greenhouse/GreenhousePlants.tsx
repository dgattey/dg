import type { CSSProperties } from 'react';
import bop1024Avif from './foliage/bop-1024.avif';
import bop1024Webp from './foliage/bop-1024.webp';
import bop768Avif from './foliage/bop-768.avif';
import bop768Webp from './foliage/bop-768.webp';
import calathea1024Avif from './foliage/calathea-1024.avif';
import calathea1024Webp from './foliage/calathea-1024.webp';
import calathea768Avif from './foliage/calathea-768.avif';
import calathea768Webp from './foliage/calathea-768.webp';
import monstera1024Avif from './foliage/monstera-1024.avif';
import monstera1024Webp from './foliage/monstera-1024.webp';
import monstera768Avif from './foliage/monstera-768.avif';
import monstera768Webp from './foliage/monstera-768.webp';
import nerve1024Avif from './foliage/nerve-1024.avif';
import nerve1024Webp from './foliage/nerve-1024.webp';
import nerve768Avif from './foliage/nerve-768.avif';
import nerve768Webp from './foliage/nerve-768.webp';
import styles from './greenhouse.module.css';
import type { LeafSymbol, PlantInstance, PlantLayer } from './greenhouseLayout';

type GreenhousePlantsProps = {
  plants: ReadonlyArray<PlantInstance>;
  layer: PlantLayer;
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
export function GreenhousePlants({ plants, layer }: GreenhousePlantsProps) {
  const items = plants.filter((plant) => plant.layer === layer && FOLIAGE[plant.symbol]);
  return (
    <div aria-hidden="true" className={layer === 'back' ? styles.plantsBack : styles.plantsFront}>
      {items.map((plant) => {
        const asset = FOLIAGE[plant.symbol];
        if (!asset) {
          return null;
        }
        const mass = plant.featured ? 34 : 28;
        return (
          <picture
            className={styles.plant}
            data-cluster={plant.cluster}
            data-featured={plant.featured ? 'true' : undefined}
            key={plant.id}
            style={
              {
                '--plant-width': `${plant.scale * mass}vmin`,
                maxWidth: `${asset.width}px`,
                transform: `rotate(${plant.rotate}deg)`,
                ...plantPosition(plant),
              } as CSSProperties
            }
          >
            <source
              media="(max-width: 575px)"
              srcSet={asset.mobileAvif}
              type="image/avif"
            />
            <source
              media="(max-width: 575px)"
              srcSet={asset.mobileWebp}
              type="image/webp"
            />
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
