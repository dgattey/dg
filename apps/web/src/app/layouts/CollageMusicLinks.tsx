'use client';

import type { HeaderNavItem } from '@dg/content-models/contentful/renderables/footer';
import { favoriteAlbumsRoute, musicRoute, musicStatsRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { LucideIcon } from 'lucide-react';
import { ChartColumn, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HoverMenu, MenuChevron, PillMenuList } from '../collage/PillMenu';
import { cx } from '../collage/paperVars';
import {
  DEFAULT_HEADER_NAV_ITEMS,
  isMusicDestinationPath,
  normalizeMusicPath,
} from './musicHeaderDestinations';

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
  [musicStatsRoute]: ChartColumn,
  albums: DiscAlbum,
  history: History,
  stats: ChartColumn,
};

/**
 * Header navigation links and dropdown submenus driven from Contentful (`header` section),
 * as segments of the header's paper strip. `<details>` owns the open state so each menu
 * opens and its links work without script; script opens it on mouse hover, and closes it
 * on link click, outside press, and Escape.
 */
export function CollageMusicLinks({ items }: { items?: ReadonlyArray<HeaderNavItem> } = {}) {
  const pathname = normalizeMusicPath(usePathname() ?? '/');
  const isAt = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const navItems = items && items.length > 0 ? items : DEFAULT_HEADER_NAV_ITEMS;

  return (
    <>
      {navItems.map((item) => {
        if (item.kind === 'menu') {
          const onMenuPage =
            item.links.some((link) => normalizeMusicPath(link.url) === pathname) ||
            (item.slug === 'header-music' && isMusicDestinationPath(pathname));
          return (
            <HoverMenu
              itemSelector="a[href]"
              key={item.slug ?? item.title}
              summary={
                <>
                  {item.title}
                  <MenuChevron />
                </>
              }
              summaryClassName={cx('chrome__segment', onMenuPage && 'chrome__segmentCurrent')}
            >
              <PillMenuList>
                {item.links.map((link) => {
                  const normalizedUrl = normalizeMusicPath(link.url);
                  const Icon =
                    (link.icon ? DESTINATION_ICONS[link.icon] : undefined) ??
                    DESTINATION_ICONS[normalizedUrl];
                  const current = pathname === normalizedUrl;
                  return (
                    <li key={link.url}>
                      <PageTransitionLink
                        aria-current={current ? 'page' : undefined}
                        className="chrome__musicLink"
                        href={link.url}
                        title={link.title}
                      >
                        {Icon ? <Icon aria-hidden={true} size={20} /> : null}
                        {link.title}
                      </PageTransitionLink>
                    </li>
                  );
                })}
              </PillMenuList>
            </HoverMenu>
          );
        }

        const current = isAt(normalizeMusicPath(item.link.url));
        return (
          <PageTransitionLink
            aria-current={current ? 'page' : undefined}
            className={cx('chrome__segment', current && 'chrome__segmentCurrent')}
            href={item.link.url}
            key={item.link.url}
            title={item.link.title}
          >
            {item.link.title}
          </PageTransitionLink>
        );
      })}
    </>
  );
}
