import { markdownPages } from '@dg/shared-core/routes/app';
import type { MetadataRoute } from 'next';
import { metadataBase } from './metadata';

/**
 * Sitemap entries are derived from the Markdown page registry so public
 * HTML pages stay discoverable without a parallel list.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return markdownPages.map((page) => ({
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    url: new URL(page.path, metadataBase).toString(),
  }));
}
