import 'server-only';

import {
  type RenderableSideProject,
  SIDE_PROJECTS_LIMIT,
  takeNewestSideProjects,
  toRenderableSideProject,
} from '@dg/content-models/contentful/renderables/sideProjects';
import { projectsResponseSchema } from '@dg/content-models/contentful/schema/projects';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { gql } from 'graphql-request';
import { fetchAppSiteIcon } from '../appSites/fetchAppSiteIcon';
import { parseResponse } from '../clients/parseResponse';
import { getContentfulClient } from './contentfulClient';

/**
 * Newest flagged side projects for the homepage card.
 * Uses project.isSideProject and creationDate (same recency as the grid).
 */
const QUERY = gql`
  query SideProjects {
    projectCollection(limit: ${SIDE_PROJECTS_LIMIT}, where: { isSideProject: true }, order: creationDate_DESC) {
      items {
        title
        summary
        creationDate
        isSideProject
        link {
          url
        }
        thumbnail {
          url(transform: { quality: 90, format: WEBP, width: 80, height: 80 })
          width
          height
          title
        }
      }
    }
  }
`;

const FALLBACK_SIDE_PROJECTS: ReadonlyArray<RenderableSideProject> = [
  {
    creationDate: '2026-10-22T00:00:00.000Z',
    description: 'Family photos on e-ink frames',
    mark: {
      height: 1024,
      title: 'Gattey Photos',
      url: 'https://photos.gattey.com/icon.png',
      width: 1024,
    },
    title: 'Gattey Photos',
    url: 'https://photos.gattey.com',
  },
  {
    creationDate: '2026-10-15T00:00:00.000Z',
    description: 'Track books, notes, and reading progress',
    mark: {
      height: 1024,
      title: 'Saga',
      url: 'https://saga.gattey.com/app-icon.png',
      width: 1024,
    },
    title: 'Saga',
    url: 'https://saga.gattey.com',
  },
  {
    creationDate: '2026-10-14T00:00:00.000Z',
    description: 'Spatial audio for Sonos and Spotify',
    mark: {
      height: 1024,
      title: 'Sconeos',
      url: 'https://sconeos.gattey.com/app-icon.png',
      width: 1024,
    },
    title: 'Sconeos',
    url: 'https://sconeos.gattey.com',
  },
  {
    creationDate: '2026-01-12T00:00:00.000Z',
    description: 'Score Lost Cities by photo or manual entry',
    mark: {
      height: 160,
      title: 'Lost Cities scorer',
      url: 'https://images.ctfassets.net/nb3rzo39eupw/6Gq98tdsqsdu3yWPHOtTgF/910dd0814ef573809989fa503bc86fa8/lost-mark.png?w=80&h=80&q=90&fm=webp',
      width: 160,
    },
    title: 'Lost Cities scorer',
    url: 'https://lostcities.app',
  },
  {
    creationDate: '2022-05-01T00:00:00.000Z',
    description: 'See what you own and where it sits',
    mark: {
      height: 160,
      title: 'WMM',
      url: 'https://images.ctfassets.net/nb3rzo39eupw/3seuA6f6nErF65Adt1zzxS/d70163f7ab3f94b7d19c12de18134af5/wmm-mark.png?w=80&h=80&q=90&fm=webp',
      width: 160,
    },
    title: 'WMM',
    url: 'https://wmm.gattey.com',
  },
];

/**
 * Fetches at most SIDE_PROJECTS_LIMIT newest side projects and uses each
 * app site's live icon when that site serves one.
 */
export async function fetchSideProjects(): Promise<Array<RenderableSideProject>> {
  let projects: Array<RenderableSideProject>;
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
    projects = [...FALLBACK_SIDE_PROJECTS];
  } else {
    const data = parseResponse(projectsResponseSchema, await getContentfulClient().request(QUERY), {
      kind: 'graphql',
      source: 'contentful.fetchSideProjects',
    });
    projects = takeNewestSideProjects(
      (data.projectCollection?.items ?? []).map(toRenderableSideProject).filter(isNotNullish),
      SIDE_PROJECTS_LIMIT,
    );
  }
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      mark: (await fetchAppSiteIcon(project.url)) ?? project.mark,
    })),
  );
}
