import {
  apiCatalogRoute,
  apiStatusRoute,
  changelogRoute,
  favoriteAlbumsRoute,
  homeRoute,
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  llmsTxtRoute,
  type MarkdownPagePath,
  musicRoute,
  musicStatsRoute,
  readingRoute,
  siteMapRoute,
  stravaRoute,
} from '@dg/shared-core/routes/app';
import type { PaperEdge, PaperTone } from '../collage/types';

export type SiteMapPageEntry = {
  description: string;
  edge: PaperEdge;
  label: string;
  markdownPath: string;
  path: MarkdownPagePath;
  tiltDeg: number;
  tone: PaperTone;
};

export type SiteMapSurfaceEntry = {
  badge: string;
  description: string;
  href: string;
  label: string;
};

export type SiteMapExternalEntry = {
  description: string;
  domain: string;
  href: string;
  label: string;
};

export const SITE_MAP_PAGES: ReadonlyArray<SiteMapPageEntry> = [
  {
    description: 'Bio, featured work, live Spotify & Strava cards, and side projects.',
    edge: 'quad-a',
    label: 'Home',
    markdownPath: htmlPathToMarkdownPath(homeRoute),
    path: homeRoute,
    tiltDeg: -0.8,
    tone: 'cream',
  },
  {
    description: 'Totals, top albums podium, 24-hour turntable clock, and listening habits.',
    edge: 'quad-b',
    label: 'Listening stats',
    markdownPath: htmlPathToMarkdownPath(musicStatsRoute),
    path: musicStatsRoute,
    tiltDeg: 0.7,
    tone: 'cobalt',
  },
  {
    description: 'Live and recent Spotify plays grouped by day and album stacks.',
    edge: 'quad-c',
    label: 'Plays',
    markdownPath: htmlPathToMarkdownPath(musicRoute),
    path: musicRoute,
    tiltDeg: -0.6,
    tone: 'viridian',
  },
  {
    description: 'All-time favorite albums crate with in-place tracklist wells.',
    edge: 'quad-d',
    label: 'Favorite albums',
    markdownPath: htmlPathToMarkdownPath(favoriteAlbumsRoute),
    path: favoriteAlbumsRoute,
    tiltDeg: 0.9,
    tone: 'vermilion',
  },
  {
    description: 'Books read, star ratings, and review slips shelved by year.',
    edge: 'quad-a',
    label: 'Reads',
    markdownPath: htmlPathToMarkdownPath(readingRoute),
    path: readingRoute,
    tiltDeg: -0.7,
    tone: 'leaf',
  },
  {
    description: 'Interactive route atlas, yearly miles tickets, and biggest climbs.',
    edge: 'quad-b',
    label: 'Big map',
    markdownPath: htmlPathToMarkdownPath(stravaRoute),
    path: stravaRoute,
    tiltDeg: 0.6,
    tone: 'ultramarine',
  },
  {
    description: 'Every version and release shipped on dylangattey.com since 2021.',
    edge: 'quad-c',
    label: 'Changelog',
    markdownPath: htmlPathToMarkdownPath(changelogRoute),
    path: changelogRoute,
    tiltDeg: -0.9,
    tone: 'rose',
  },
  {
    description: 'Complete directory of pages, agent endpoints, apps, and external links.',
    edge: 'quad-d',
    label: 'Site map',
    markdownPath: htmlPathToMarkdownPath(siteMapRoute),
    path: siteMapRoute,
    tiltDeg: 0.5,
    tone: 'cream',
  },
];

export const SITE_MAP_AGENT_SURFACES: ReadonlyArray<SiteMapSurfaceEntry> = [
  {
    badge: 'Markdown',
    description: 'Curated index of Markdown-capable pages for LLMs and coding agents.',
    href: llmsTxtRoute,
    label: 'LLM summary',
  },
  {
    badge: 'Markdown',
    description: 'Every public page concatenated into a single token-efficient document.',
    href: llmsFullTxtRoute,
    label: 'Full LLM context',
  },
  {
    badge: 'XML',
    description: 'Search engine and crawler sitemap derived from the route registry.',
    href: '/sitemap.xml',
    label: 'XML sitemap',
  },
  {
    badge: 'OpenAPI 3.1',
    description: 'Machine-readable schema for all public content discovery endpoints.',
    href: '/openapi.json',
    label: 'OpenAPI spec',
  },
  {
    badge: 'RFC 9727',
    description: 'Linkset catalog advertising service descriptions, docs, and health.',
    href: apiCatalogRoute,
    label: 'API catalog',
  },
  {
    badge: 'RFC v0.2.0',
    description: 'Agent Skills Discovery index with SHA-256 digests and SKILL.md endpoints.',
    href: '/.well-known/agent-skills/index.json',
    label: 'Agent skills',
  },
  {
    badge: 'JSON',
    description: 'Lightweight health check endpoint for API catalog consumers.',
    href: apiStatusRoute,
    label: 'API status',
  },
  {
    badge: 'PNG',
    description: 'Paper-cut collage Open Graph social preview card (1200×630).',
    href: '/opengraph-image',
    label: 'Social card',
  },
];

export const SITE_MAP_APPS: ReadonlyArray<SiteMapExternalEntry> = [
  {
    description: 'Personal relationship manager and notes for staying close to people.',
    domain: 'saga.gattey.com',
    href: 'https://saga.gattey.com',
    label: 'Saga',
  },
  {
    description: 'Smart home and household operating system.',
    domain: 'sconeos.gattey.com',
    href: 'https://sconeos.gattey.com',
    label: 'Sconeos',
  },
  {
    description: 'Curated photography portfolio and high-resolution galleries.',
    domain: 'photos.gattey.com',
    href: 'https://photos.gattey.com',
    label: 'Gattey Photos',
  },
  {
    description: 'Fast two-player expedition calculator for the Lost Cities card game.',
    domain: 'lostcities.gattey.com',
    href: 'https://lostcities.gattey.com',
    label: 'Lost Cities scorer',
  },
  {
    description: 'Where Did My Money Go — lightweight personal finance tracker.',
    domain: 'wmm.gattey.com',
    href: 'https://wmm.gattey.com',
    label: 'WMM',
  },
];

export const DEFAULT_ELSEWHERE_LINKS: ReadonlyArray<SiteMapExternalEntry> = [
  {
    description: 'cursor.com/@dyl',
    domain: 'cursor.com',
    href: 'https://cursor.com/@dyl',
    label: 'Cursor',
  },
  {
    description: 'github.com/dgattey',
    domain: 'github.com',
    href: 'https://github.com/dgattey',
    label: 'GitHub',
  },
  {
    description: 'strava.com/athletes/17469310',
    domain: 'strava.com',
    href: 'https://www.strava.com/athletes/17469310',
    label: 'Strava',
  },
  {
    description: 'open.spotify.com/user/dylangattey',
    domain: 'open.spotify.com',
    href: 'https://open.spotify.com/user/dylangattey',
    label: 'Spotify',
  },
  {
    description: 'instagram.com/dylangattey',
    domain: 'instagram.com',
    href: 'https://www.instagram.com/dylangattey',
    label: 'Instagram',
  },
  {
    description: 'x.com/dyl_gat',
    domain: 'x.com',
    href: 'https://x.com/dyl_gat',
    label: 'X',
  },
  {
    description: 'linkedin.com/in/dgattey',
    domain: 'linkedin.com',
    href: 'https://www.linkedin.com/in/dgattey',
    label: 'LinkedIn',
  },
];
