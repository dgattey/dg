import 'server-only';

import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { getSideProjects } from '../../services/contentful';
import { GatteySitesCard } from './GatteySitesCard';

/**
 * Loads published Contentful side projects for the homepage card.
 * Returns null when none are available so the grid can omit the slot.
 */
export async function GatteySitesCardSlot({
  fixture,
}: {
  fixture?: ReadonlyArray<RenderableSideProject>;
} = {}) {
  const projects = fixture ?? (await getSideProjects());
  if (projects.length === 0) {
    return null;
  }
  return <GatteySitesCard projects={projects} />;
}
