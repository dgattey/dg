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

/** Flag-on homepage. Builds the island for a seed the proxy already chose. */

type PlantedCard = {
  id: string;
  label: string;
  node: ReactNode;
};

/** Marks the DOM so the scoped global style can pull the header into the world. */
export const FOREST_WORLD_ATTRIBUTE = 'data-forest-world';

const forestPageSx: SxObject = {
  ...FOREST_COLOR_VARS,
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
      border-radius:10px;
      box-shadow:0 8px 18px -12px var(--forest-shadow);
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
    }
    [${FOREST_WORLD_ATTRIBUTE}] svg image,
    [${FOREST_WORLD_ATTRIBUTE}] img.forest-land{
      image-rendering:auto;
      image-rendering:smooth;
      image-rendering:high-quality;
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
            >
              {card.node}
            </ForestLandmark>
          );
        })}
      </ForestScene>
    </Box>
  );
}
