import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';

/** Neighbours never share an angle, so the stack reads as hand-placed paper. */
const ROW_TILTS = [-1.6, 1.4, -1.9, 1.5, -1.3] as const;

type GatteySitesCardProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

export function GatteySitesCard({ projects }: GatteySitesCardProps) {
  if (projects.length === 0) {
    return null;
  }

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
                tiltDeg={ROW_TILTS[index % ROW_TILTS.length]}
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
                    <Tooltip title={project.description} whenTruncated>
                      <span className="home__sideDescription">{project.description}</span>
                    </Tooltip>
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
