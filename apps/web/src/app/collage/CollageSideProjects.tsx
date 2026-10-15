import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { Image } from '@dg/ui/dependent/Image';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';

export function CollageSideProjects({
  projects,
}: {
  projects: ReadonlyArray<RenderableSideProject>;
}) {
  return (
    <div className="home__sideRoot" data-slot="sd" style={{ gridArea: 'sd', marginTop: 6 }}>
      <h2 className="home__sideHeadingWrap">
        <PaperTag className="collageEyebrow" edge="quad-c" tiltDeg={-3} tone="vermilion">
          Side projects
        </PaperTag>
      </h2>
      <ul className="home__sideList">
        {projects.map((project, index) => {
          const even = index % 2 === 0;
          return (
            <li className="home__sideItem" key={project.url}>
              <PaperCard
                className="home__sideRowWrap collageLift"
                edge={even ? 'quad-a' : 'quad-d'}
                tiltDeg={even ? 1.5 : -1.2}
                tone="cream"
              >
                <a className="home__sideRow" href={project.url} rel="noreferrer" target="_blank">
                  <span aria-hidden="true" className="home__sideMark" data-role="side-project-mark">
                    <Image
                      alt=""
                      height={project.mark.height}
                      sizes={{ extraLarge: 44 }}
                      url={project.mark.url}
                      width={project.mark.width}
                    />
                  </span>
                  <span className="home__sideText">
                    <b className="home__sideTitle">{project.title}</b>
                    <span className="home__sideDescription">{project.description}</span>
                  </span>
                  <span aria-hidden="true" className="home__sideArrow">
                    ↗
                  </span>
                </a>
              </PaperCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
