import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import type { MetadataRoute } from 'next';
import { metadataBase } from './metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: 'weekly',
      priority: 1,
      url: new URL(homeRoute, metadataBase).toString(),
    },
    {
      changeFrequency: 'daily',
      priority: 0.7,
      url: new URL(musicRoute, metadataBase).toString(),
    },
  ];
}
