import 'server-only';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { getProjects } from '../../../services/contentful';
import { GatteySitesCardSlot } from '../GatteySitesCardSlot';
import { MapCardSlot } from '../MapCardSlot';
import { mergeCards } from '../mergeCards';
import { ProjectCard } from '../ProjectCard';
import { SpotifyCardSlot } from '../SpotifyCard';
import { StravaCardSlot } from '../StravaCardSlot';
import { ForestIntroImageSlot, ForestIntroTextSlot } from './ForestIntroSlots';
import { ForestLandmark } from './ForestLandmark';
import { ForestMinimap } from './ForestMinimap';
import { ForestScene } from './ForestScene';
import { ForestTerrain } from './ForestTerrain';
import { FOREST_FIXED_CARD_IDS } from './forestCards';
import { buildForestWorld, DEFAULT_FOREST_SEED, toBlockedMask } from './forestMap';
import { boardMediaSx } from './forestMaterials';
import { FOREST_COLOR_VARS } from './forestPalette';

/**
 * The homepage as a full-page walkable island, behind `interactive-redesign`.
 *
 * The world owns the viewport: it breaks out of the page container, sits flush
 * under the header and floods the ocean to every edge, so there is no card frame
 * or cream page around it. The header stays put but is restyled into the world's
 * HUD material by `ForestWorldStyles`. Same cards, same data, same links as the
 * grid — planted on carved boards along a trail instead of laid out in a grid.
 *
 * Seed strategy: the proxy rolls a seed from a prerendered deck and rewrites
 * `/` to `/interactive-home/s/:seed`. This component just builds that island.
 * Same seed always yields the same markup (SSR == hydration). A brand-new
 * uint32 every request generated the bitmap on the hot path (~1.5s+ TTFB);
 * the deck keeps first paint cheap. Reloads usually get a different map.
 * Tests pass `seed` directly. If none is passed, the default seed is used so
 * the unsuffixed route can still prerender a complete island at build time.
 */

type PlantedCard = {
  id: string;
  label: string;
  node: ReactNode;
};

/** Marks the DOM so the scoped global style can pull the header into the world. */
export const FOREST_WORLD_ATTRIBUTE = 'data-forest-world';

const forestPageSx: SxObject = {
  ...FOREST_COLOR_VARS,
  // Break out of the centered page container to true viewport width, then pull
  // up under the sticky header so the terrain — not a strip of page background —
  // is what sits behind the site chrome. The header keeps its space in flow, so
  // the world still measures exactly one viewport tall.
  marginInline: 'calc(50% - 50dvw)',
  marginTop: 'calc(-1 * var(--site-header-height, 5rem))',
  position: 'relative',
  width: '100dvw',
};

/** Keeps the page's h1 in the accessibility tree without drawing text over the world. */
const srOnlySx: SxObject = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

/**
 * Scoped global style, active only while a forest world is in the DOM. It hands
 * the world's material tokens to the header (which lives above this subtree),
 * removes the page spacing that used to box the world in, and swaps the header's
 * frosted-glass capsule for the same HUD material the minimap and hint use.
 *
 * It also stops the header swallowing the top of the world. The header is a
 * full-width transparent band roughly 120px tall, and the world is pulled up
 * underneath it, so every wheel event in that strip — a seventh of a laptop
 * screen, and the strip the minimap sits in — landed on the header and scrolled
 * nothing. Only the parts with chrome on them take input now.
 *
 * Written as a plain `<style>` so it needs no client component and disappears
 * with the world when the flag is off.
 */
function ForestWorldStyles() {
  const tokens = Object.entries(FOREST_COLOR_VARS as Record<string, string>)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  const css = `
    body:has([${FOREST_WORLD_ATTRIBUTE}]){${tokens};overflow-x:hidden;}
    body:has([${FOREST_WORLD_ATTRIBUTE}]) section:has(> * > main){margin-top:0;margin-bottom:0;}
    body:has([${FOREST_WORLD_ATTRIBUTE}]) section:has([data-site-header]){margin-bottom:0;}
    body:has([${FOREST_WORLD_ATTRIBUTE}]) [data-header-capsule]{
      backdrop-filter:none;
      background-color:var(--forest-hud);
      border-color:var(--forest-hud-edge);
      box-shadow:0 8px 20px -10px light-dark(hsl(140deg 30% 20% / 0.5), hsl(190deg 60% 3% / 0.7));
    }
    body:has([${FOREST_WORLD_ATTRIBUTE}]) section:has([data-site-header]),
    body:has([${FOREST_WORLD_ATTRIBUTE}]) [data-site-header]{pointer-events:none;}
    body:has([${FOREST_WORLD_ATTRIBUTE}]) [data-site-header] a,
    body:has([${FOREST_WORLD_ATTRIBUTE}]) [data-site-header] button,
    body:has([${FOREST_WORLD_ATTRIBUTE}]) [data-site-header] [data-header-capsule]{
      pointer-events:auto;
    }
    [${FOREST_WORLD_ATTRIBUTE}] [data-forest-landmark] img{
      filter:none;
      image-rendering:auto;
    }`;
  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: fixed literal, no input reaches it
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

export async function ForestHomepage({ seed }: { seed?: number } = {}) {
  const projects = await getProjects();
  const projectCards: Array<PlantedCard> = projects.map((project) => ({
    id: `project-${project.title}`,
    label: project.title,
    node: <ProjectCard {...project} />,
  }));

  // The grid's interleave order, shifted by one because the intro's portrait and
  // copy get a clearing each here instead of sharing a slot.
  const cardById: Record<string, PlantedCard> = {
    'gattey-sites': { id: 'gattey-sites', label: 'Side projects', node: <GatteySitesCardSlot /> },
    'intro-image': { id: 'intro-image', label: 'About', node: <ForestIntroImageSlot /> },
    'intro-text': { id: 'intro-text', label: 'Hey friends', node: <ForestIntroTextSlot /> },
    map: {
      id: 'map',
      label: 'Where I am',
      node: (
        <Box sx={boardMediaSx}>
          <MapCardSlot />
        </Box>
      ),
    },
    spotify: {
      id: 'spotify',
      label: 'Now playing',
      node: <SpotifyCardSlot glowVariant="none" />,
    },
    strava: { id: 'strava', label: 'Latest activity', node: <StravaCardSlot /> },
  };
  const preciselyPlacedCards = new Map<number, PlantedCard>(
    [...FOREST_FIXED_CARD_IDS.entries()].flatMap(([index, id]) => {
      const card = cardById[id];
      return card ? [[index, card] as const] : [];
    }),
  );

  const planted = mergeCards(projectCards, preciselyPlacedCards).filter(
    (card): card is PlantedCard => card !== undefined,
  );
  const world = buildForestWorld(
    planted.map((card) => card.id),
    seed ?? DEFAULT_FOREST_SEED,
  );

  return (
    <Box {...{ [FOREST_WORLD_ATTRIBUTE]: true }} component="section" sx={forestPageSx}>
      <ForestWorldStyles />
      <Box component="h1" sx={srOnlySx}>
        A small island of everything I&rsquo;m up to. Walk the trail and see what you find.
      </Box>
      <ForestScene
        blockedMask={toBlockedMask(world)}
        columns={world.columns}
        overlay={<ForestMinimap world={world} />}
        rows={world.rows}
        spawn={world.spawn}
      >
        <ForestTerrain world={world} />
        {planted.map((card, index) => {
          const plot = world.plots[index];
          if (!plot) {
            return null;
          }
          return (
            <ForestLandmark
              id={card.id}
              key={card.id}
              label={card.label}
              tileX={plot.tileX}
              tileY={plot.tileY}
              variant="board"
            >
              {card.node}
            </ForestLandmark>
          );
        })}
      </ForestScene>
    </Box>
  );
}
