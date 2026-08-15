import 'server-only';

import { getProjects } from '../../../services/contentful';
import { mergeCards } from '../mergeCards';

/**
 * Slot indices shared by the planted homepage and the ground-bitmap route, so
 * a seed always builds the same world for the page and its PNG.
 */
export const FOREST_FIXED_CARD_IDS = new Map<number, string>([
  [0, 'intro-image'],
  [1, 'intro-text'],
  [2, 'map'],
  [4, 'spotify'],
  [5, 'strava'],
  [8, 'gattey-sites'],
]);

export async function listForestCardIds(): Promise<Array<string>> {
  const projects = await getProjects();
  const projectIds = projects.map((project) => `project-${project.title}`);
  return mergeCards(projectIds, FOREST_FIXED_CARD_IDS).filter(
    (id): id is string => id !== undefined,
  );
}
