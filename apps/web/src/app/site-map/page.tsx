import 'server-only';
import './siteMap.css';

import { siteMapRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSideProjects } from '../../services/contentful';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { SideProjectMark } from '../home/GatteySitesCard';
import { formatElsewhereHandle } from '../layouts/Footer';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { SITE_MAP_AGENT_SURFACES, SITE_MAP_BACKDROP, SITE_MAP_PAGES } from './siteMapCatalog';

const TITLE = 'Site map';
const DESCRIPTION = 'All pages, side projects, and machine-readable endpoints.';

export const metadata: Metadata = {
  alternates: markdownAlternates(siteMapRoute),
  description: DESCRIPTION,
  title: TITLE,
};

export async function SiteMapDirectory() {
  const sideProjects = await getSideProjects().catch(() => []);

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
                    title={`${page.label} Markdown (${page.markdownPath})`}
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

      {sideProjects.length > 0 ? (
        <section aria-label="Side projects" className="siteMap__section">
          <h2 className="siteMap__sectionHeading">
            <PaperTag className="siteMap__sectionTag" edge="quad-c" tiltDeg={-1.5} tone="ochre">
              Side projects
            </PaperTag>
          </h2>
          <ul className="siteMap__appsGrid">
            {sideProjects.map((project, index) => {
              const even = index % 2 === 0;
              const domain = formatElsewhereHandle(project.url);
              return (
                <li className="siteMap__appItem" key={project.url}>
                  <PaperCard
                    className="siteMap__appCard collageLift"
                    edge={even ? 'quad-a' : 'quad-d'}
                    innerClassName="siteMap__appCardInner"
                    tiltDeg={even ? 0.6 : -0.6}
                    tone="cream"
                  >
                    <a
                      className="siteMap__appRow"
                      href={project.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SideProjectMark className="siteMap__appMark" mark={project.mark} />
                      <span className="siteMap__appBody">
                        <span className="siteMap__appHeader">
                          <b className="siteMap__appTitle">{project.title}</b>
                          <span className="siteMap__appDomain">{domain}</span>
                        </span>
                        <p className="siteMap__appDesc">{project.description}</p>
                      </span>
                      <span aria-hidden="true" className="siteMap__appArrow">
                        ↗
                      </span>
                    </a>
                  </PaperCard>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

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
    </div>
  );
}

export default function SiteMapPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost siteMap__layout">
      <CollageBackdrop backdrop={SITE_MAP_BACKDROP} />
      <CutLetters className="collagePageTitle" text={TITLE} />
      <Suspense fallback={null}>
        <SiteMapDirectory />
      </Suspense>
    </section>
  );
}
