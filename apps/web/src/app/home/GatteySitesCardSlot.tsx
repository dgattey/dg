import 'server-only';

import { getSideProjects } from '../../services/contentful';
import { GatteySitesCard } from './GatteySitesCard';

/**
 * Loads published Contentful side projects for the homepage card.
 * Returns null when none are available so the grid can omit the slot.
 */
export async function GatteySitesCardSlot() {
  const projects = await getSideProjects();
  if (projects.length === 0) {
    return null;
  }
  return <GatteySitesCard projects={projects} />;
}
