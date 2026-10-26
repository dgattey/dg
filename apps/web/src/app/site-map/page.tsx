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
          <PaperTag edge="quad-c" tiltDeg={-1.8} tone="vermilion" variant="title-md">
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
                    <span className="siteMap__pageTitle" data-typography="title-md">
                      {page.label}
                    </span>
                    <span className="siteMap__routeBadge" data-typography="badge">
                      {page.path}
                    </span>
                  </div>
                  <p className="siteMap__pageDesc" data-typography="prose">
                    {page.description}
                  </p>
                </PageTransitionLink>
                <div className="siteMap__pageFooter">
                  <a
                    className="siteMap__mdLink"
                    data-typography="badge"
                    href={page.markdownPath}
                    title={`${page.label} Markdown (${page.markdownPath})`}
                  >
                    {page.markdownPath}
                  </a>
                  <span aria-hidden="true" className="siteMap__openHint" data-typography="badge">
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
            <PaperTag edge="quad-c" tiltDeg={-1.5} tone="ochre" variant="title-md">
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
                          <b className="siteMap__appTitle" data-typography="title-sm">
                            {project.title}
                          </b>
                          <span className="siteMap__appDomain" data-typography="badge">
                            {domain}
                          </span>
                        </span>
                        <p className="siteMap__appDesc" data-typography="prose">
                          {project.description}
                        </p>
                      </span>
                      <span
                        aria-hidden="true"
                        className="siteMap__appArrow"
                        data-typography="title-sm"
                      >
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
          <PaperTag edge="quad-b" tiltDeg={1.5} tone="cobalt" variant="title-md">
            Agent and API surfaces
          </PaperTag>
        </h2>
        <PaperCard edge="quad-a" innerClassName="siteMap__ledgerInner" tiltDeg={-0.4} tone="cream">
          <ul className="siteMap__surfacesGrid">
            {SITE_MAP_AGENT_SURFACES.map((surface) => (
              <li key={surface.href}>
                <a className="siteMap__ledgerRow" href={surface.href}>
                  <div className="siteMap__ledgerTop">
                    <span data-typography="label">{surface.label}</span>
                    <span className="siteMap__ledgerBadge" data-typography="stamp">
                      {surface.badge}
                    </span>
                  </div>
                  <span className="siteMap__ledgerPath" data-typography="badge">
                    {surface.href}
                  </span>
                  <p className="siteMap__ledgerDesc" data-typography="prose">
                    {surface.description}
                  </p>
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
