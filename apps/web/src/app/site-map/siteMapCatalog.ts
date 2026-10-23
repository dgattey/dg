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
import { defineBackdrop } from '../collage/backdrops';
import type { PaperEdge, PaperTone } from '../collage/types';

export const SITE_MAP_BACKDROP = defineBackdrop(1100, 3, [
  {
    cutOuts: [
      ['sitemap-monstera', 'monstera', 'viridian', 420, -18, 84, -4, 'desktop', 0],
      [
        'sitemap-swallow',
        'swallow',
        'vermilion',
        180,
        -14,
        82,
        14,
        'desktop',
        1,
        { underprint: ['cream', 5, 6] },
      ],
      ['sitemap-fern', 'fern', 'olive', 310, 19, -8, 42, 'desktop', 0],
      ['sitemap-coral', 'coral', 'rose', 230, -15, 84, 68, 'desktop', 1],
      ['sitemap-trefoil-top', 'trefoil', 'chartreuse', 140, -21, 3, 82, 'all', 1],
    ],
    sheets: [
      ['sitemap-ruled', 'torn', 'ruled', ['cream', 'cerulean'], 72, 16, 34, 380, -3.2, 'desktop'],
      ['sitemap-pebble-ochre', 'pebble', 'solid', 'ochre', -9, 22, 360, -12, 'all'],
      ['sitemap-gingham', 'torn', 'gingham', ['ochre', 'vermilion'], 62, 56, 40, 360, 3.4, 'all'],
    ],
  },
  {
    cutOuts: [
      ['sitemap-pods', 'pods', 'ochre', 220, 22, -6, 24, 'all', 1],
      ['sitemap-seaweed2', 'seaweed2', 'ultramarine', 230, 15, 84, 58, 'desktop', 1],
      ['sitemap-star', 'star5', 'star', 46, -14, 88, 10, 'desktop', 1],
    ],
    sheets: [
      ['sitemap-dots', 'torn', 'dots', ['viridian', 'leaf'], 56, 10, 44, 380, -2.8, 'all'],
      ['sitemap-disc-cobalt', 'disc', 'starfield', 'ultramarine', -7, 46, 280, 0, 'desktop'],
    ],
  },
]);

type SiteMapPageEntry = {
  description: string;
  edge: PaperEdge;
  label: string;
  markdownPath: string;
  path: MarkdownPagePath;
  tiltDeg: number;
  tone: PaperTone;
};

type SiteMapSurfaceEntry = {
  badge: string;
  description: string;
  href: string;
  label: string;
};

export const SITE_MAP_PAGES: ReadonlyArray<SiteMapPageEntry> = [
  {
    description: 'About, featured work, live music and Strava activity, and side projects.',
    edge: 'quad-a',
    label: 'Home',
    markdownPath: htmlPathToMarkdownPath(homeRoute),
    path: homeRoute,
    tiltDeg: -0.8,
    tone: 'cream',
  },
  {
    description: 'Totals, top albums, and listening habits from my Spotify history.',
    edge: 'quad-b',
    label: 'Listening stats',
    markdownPath: htmlPathToMarkdownPath(musicStatsRoute),
    path: musicStatsRoute,
    tiltDeg: 0.7,
    tone: 'cobalt',
  },
  {
    description: 'Recent Spotify plays grouped by day and album.',
    edge: 'quad-c',
    label: 'Plays',
    markdownPath: htmlPathToMarkdownPath(musicRoute),
    path: musicRoute,
    tiltDeg: -0.6,
    tone: 'viridian',
  },
  {
    description: 'All-time favorite albums with in-place tracklists.',
    edge: 'quad-d',
    label: 'Favorite albums',
    markdownPath: htmlPathToMarkdownPath(favoriteAlbumsRoute),
    path: favoriteAlbumsRoute,
    tiltDeg: 0.9,
    tone: 'vermilion',
  },
  {
    description: 'Books read, star ratings, and notes by year.',
    edge: 'quad-a',
    label: 'Reads',
    markdownPath: htmlPathToMarkdownPath(readingRoute),
    path: readingRoute,
    tiltDeg: -0.7,
    tone: 'leaf',
  },
  {
    description: 'Interactive route map, yearly miles, and biggest climbs.',
    edge: 'quad-b',
    label: 'Big map',
    markdownPath: htmlPathToMarkdownPath(stravaRoute),
    path: stravaRoute,
    tiltDeg: 0.6,
    tone: 'ultramarine',
  },
  {
    description: 'Version history and release notes.',
    edge: 'quad-c',
    label: 'Changelog',
    markdownPath: htmlPathToMarkdownPath(changelogRoute),
    path: changelogRoute,
    tiltDeg: -0.9,
    tone: 'rose',
  },
  {
    description: 'Directory of public routes, side projects, and agent endpoints.',
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
    description: 'Every public page concatenated into a single document.',
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
    description: 'Machine-readable schema for public content discovery endpoints.',
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
    description: 'Health check endpoint for API catalog consumers.',
    href: apiStatusRoute,
    label: 'API status',
  },
  {
    badge: 'PNG',
    description: 'Open Graph social preview image (1200×630).',
    href: '/opengraph-image',
    label: 'Social card',
  },
];
