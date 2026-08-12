import 'server-only';

import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
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
import { buildForestWorld, toBlockedMask } from './forestMap';

/**
 * The homepage as a small island you walk around, behind `interactive-redesign`.
 *
 * Same cards, same data, same links as the grid — they are just planted in
 * clearings instead of laid out in rows. The island is generated from the card
 * order, so this stays a switch on presentation rather than a second homepage
 * with its own content.
 */

type PlantedCard = {
  id: string;
  label: string;
  node: ReactNode;
};

const introSx: SxObject = {
  marginBottom: 2,
  maxWidth: '42rem',
};

export async function ForestHomepage() {
  const projects = await getProjects();
  const projectCards: Array<PlantedCard> = projects.map((project) => ({
    id: `project-${project.title}`,
    label: project.title,
    node: <ProjectCard {...project} />,
  }));

  // The grid's interleave order, shifted by one because the intro's portrait and
  // copy get a clearing each here instead of sharing a slot.
  const preciselyPlacedCards = new Map<number, PlantedCard>([
    [0, { id: 'intro-image', label: 'About', node: <ForestIntroImageSlot /> }],
    [1, { id: 'intro-text', label: 'Hey friends', node: <ForestIntroTextSlot /> }],
    [2, { id: 'map', label: 'Where I am', node: <MapCardSlot /> }],
    [4, { id: 'spotify', label: 'Now playing', node: <SpotifyCardSlot glowVariant="ambient" /> }],
    [5, { id: 'strava', label: 'Latest activity', node: <StravaCardSlot /> }],
    [8, { id: 'gattey-sites', label: 'Side projects', node: <GatteySitesCardSlot /> }],
  ]);

  const planted = mergeCards(projectCards, preciselyPlacedCards).filter(
    (card): card is PlantedCard => card !== undefined,
  );
  const world = buildForestWorld(planted.map((card) => card.id));

  return (
    <Box component="section">
      <Typography component="h1" sx={introSx} variant="h4">
        A small island of everything I&rsquo;m up to. Walk the trail and see what you find.
      </Typography>
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
