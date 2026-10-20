import 'server-only';

import { getSideProjects } from '../../services/contentful';
import { GatteySitesCard } from './GatteySitesCard';

export async function GatteySitesCardSlot() {
  const projects = await getSideProjects();
  if (projects.length === 0) {
    return null;
  }
  return <GatteySitesCard projects={projects} />;
}
