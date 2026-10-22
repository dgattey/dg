import 'server-only';
import './siteMap.css';

import { siteMapRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getFooterLinks, getSideProjects } from '../../services/contentful';
import { READING_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { formatElsewhereHandle } from '../layouts/Footer';
import { markdownAlternates } from '../layouts/markdownAlternates';
import {
  DEFAULT_ELSEWHERE_LINKS,
  SITE_MAP_AGENT_SURFACES,
  SITE_MAP_APPS,
  SITE_MAP_PAGES,
} from './siteMapCatalog';

const TITLE = 'Site map';
const DESCRIPTION =
  'Every page, Markdown twin, agent endpoint, and side project across dylangattey.com.';

export const metadata: Metadata = {
  alternates: markdownAlternates(siteMapRoute),
  description: DESCRIPTION,
  title: TITLE,
};

export async function SiteMapDirectory() {
  const [sideProjects, footerLinks] = await Promise.all([
    getSideProjects().catch(() => []),
    getFooterLinks().catch(() => []),
  ]);

  const byHost = new Map(
    sideProjects.map((project) => {
      try {
        return [new URL(project.url).hostname, project] as const;
      } catch {
        return [project.url, project] as const;
      }
    }),
  );

  const apps = SITE_MAP_APPS.map((entry) => {
    const live = byHost.get(entry.domain);
    return {
      description: live?.description || entry.description,
      domain: entry.domain,
      href: live?.url || entry.href,
      label: live?.title || entry.label,
    };
  });

  const nonEmailLinks = footerLinks.filter(
    (link) => link.icon !== 'email' && !link.url.startsWith('mailto:'),
  );
  const elsewhereLinks =
    nonEmailLinks.length > 0
      ? nonEmailLinks.map((link) => ({
          description: formatElsewhereHandle(link.url),
          domain: formatElsewhereHandle(link.url),
          href: link.url,
          label: link.title === 'Github' ? 'GitHub' : link.title,
        }))
      : DEFAULT_ELSEWHERE_LINKS;

  return (
    <div className="siteMap__sections">
      <section aria-label="Pages" className="siteMap__section">
        <h2 className="siteMap__sectionHeading">
          <PaperTag className="siteMap__sectionTag" edge="quad-c" tiltDeg={-1.8} tone="vermilion">
            Pages
          </PaperTag>
        </h2>
        <ul className="siteMap__pagesGrid">
          {SITE_MAP_PAGES.map((page) => (
            <li className="siteMap__pageItem" key={page.path}>
              <PaperCard
                className="siteMap__pageCard collageLift"
                edge={page.edge}
                innerClassName="siteMap__pageCardInner"
                tiltDeg={page.tiltDeg}
                tone={page.tone}
              >
                <PageTransitionLink
                  className="siteMap__pageMainLink"
                  href={page.path}
                  title={page.label}
                >
                  <div className="siteMap__pageTitleRow">
                    <span className="siteMap__pageTitle">{page.label}</span>
                    <span className="siteMap__routeBadge">{page.path}</span>
                  </div>
                  <p className="siteMap__pageDesc">{page.description}</p>
                </PageTransitionLink>
                <div className="siteMap__pageFooter">
                  <a
                    className="siteMap__mdLink"
                    href={page.markdownPath}
                    title={`${page.label} Markdown twin (${page.markdownPath})`}
                  >
                    {page.markdownPath}
                  </a>
                  <span aria-hidden="true" className="siteMap__openHint">
                    Open page →
                  </span>
                </div>
              </PaperCard>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Agent and API surfaces" className="siteMap__section">
        <h2 className="siteMap__sectionHeading">
          <PaperTag className="siteMap__sectionTag" edge="quad-b" tiltDeg={1.5} tone="cobalt">
            Agent and API surfaces
          </PaperTag>
        </h2>
        <PaperCard edge="quad-a" innerClassName="siteMap__ledgerInner" tiltDeg={-0.4} tone="cream">
          <ul className="siteMap__surfacesGrid">
            {SITE_MAP_AGENT_SURFACES.map((surface) => (
              <li key={surface.href}>
                <a className="siteMap__ledgerRow" href={surface.href}>
                  <div className="siteMap__ledgerTop">
                    <span className="siteMap__ledgerTitle">{surface.label}</span>
                    <span className="siteMap__ledgerBadge">{surface.badge}</span>
                  </div>
                  <span className="siteMap__ledgerPath">{surface.href}</span>
                  <p className="siteMap__ledgerDesc">{surface.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </PaperCard>
      </section>

      <div className="siteMap__twoCol">
        <section aria-label="Dylan's apps" className="siteMap__section">
          <h2 className="siteMap__sectionHeading">
            <PaperTag className="siteMap__sectionTag" edge="quad-c" tiltDeg={-1.5} tone="ochre">
              Dylan&apos;s apps
            </PaperTag>
          </h2>
          <PaperCard
            edge="quad-d"
            innerClassName="siteMap__ledgerInner siteMap__ledgerInner--apps"
            tiltDeg={0.6}
            tone="cream"
          >
            <ul className="siteMap__ledgerList">
              {apps.map((app) => (
                <li key={app.href}>
                  <a
                    className="siteMap__ledgerRow"
                    href={app.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="siteMap__ledgerTop">
                      <span className="siteMap__ledgerTitle">
                        {app.label} <span aria-hidden="true">↗</span>
                      </span>
                      <span className="siteMap__ledgerPath">{app.domain}</span>
                    </div>
                    <p className="siteMap__ledgerDesc">{app.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </PaperCard>
        </section>

        <section aria-label="Elsewhere" className="siteMap__section">
          <h2 className="siteMap__sectionHeading">
            <PaperTag className="siteMap__sectionTag" edge="quad-a" tiltDeg={1.4} tone="viridian">
              Elsewhere
            </PaperTag>
          </h2>
          <PaperCard
            edge="quad-b"
            innerClassName="siteMap__ledgerInner siteMap__ledgerInner--elsewhere"
            tiltDeg={-0.6}
            tone="cream"
          >
            <ul className="siteMap__ledgerList">
              {elsewhereLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="siteMap__ledgerRow"
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="siteMap__ledgerTop">
                      <span className="siteMap__ledgerTitle">
                        {link.label} <span aria-hidden="true">↗</span>
                      </span>
                      <span className="siteMap__ledgerPath">{link.description}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </PaperCard>
        </section>
      </div>
    </div>
  );
}

export default function SiteMapPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost siteMap__layout">
      <CollageBackdrop backdrop={READING_BACKDROP} />
      <div className="siteMap__intro">
        <CutLetters className="collagePageTitle" text={TITLE} />
        <p className="siteMap__lede">{DESCRIPTION}</p>
      </div>
      <Suspense fallback={null}>
        <SiteMapDirectory />
      </Suspense>
    </section>
  );
}
