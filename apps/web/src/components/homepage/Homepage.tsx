import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { IntroCardSlot } from './IntroCardSlot';
import { MapPreviewCardSlot } from './MapPreviewCardSlot';
import { ProjectCard } from './ProjectCard';
import { SpotifyCardSlot } from './SpotifyCardSlot';
import { StravaCardSlot } from './StravaCardSlot';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
export async function Homepage() {
  const projects = await getProjects();
  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  // These index into projectCards to splice in other cards
  const otherCards = [
    {
      card: <IntroCardSlot key="intro" />,
      index: 0,
    },
    { card: <MapPreviewCardSlot key="map" />, index: 0 },
    {
      card: <SpotifyCardSlot key="spotify" />,
      index: 1,
    },
    { card: <StravaCardSlot key="strava" />, index: 1 },
  ];

  return (
    <ContentGrid>
      {otherCards.map(({ index, card }, arrayIndex) => {
        const nextItem = otherCards[arrayIndex + 1];
        return [card, ...projectCards.slice(index, nextItem?.index)];
      })}
    </ContentGrid>
  );
}
