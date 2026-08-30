import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import type { ImageSizes } from '@dg/ui/dependent/Image';
import { Image } from '@dg/ui/dependent/Image';
import styles from './home.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';

type CollageSideProjectsProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

const MARK_SIZES: ImageSizes = {
  extraLarge: 44,
};

export function CollageSideProjects({ projects }: CollageSideProjectsProps) {
  return (
    <div className={styles.sideRoot} data-slot="sd">
      <h2 className={styles.sideHeadingWrap}>
        <PaperTag className={styles.sideHeading} edge="quad-c" tiltDeg={-3} tone="vermilion">
          Side projects
        </PaperTag>
      </h2>
      <ul className={styles.sideList}>
        {projects.map((project, index) => {
          const even = index % 2 === 0;
          const markTone = even ? 'ochre' : 'ultramarine';
          const edge = even ? 'quad-a' : 'quad-d';
          const tiltDeg = even ? 1.5 : -1.2;
          return (
            <li className={styles.sideItem} key={project.url}>
              <PaperCard className={styles.sideRowWrap} edge={edge} tiltDeg={tiltDeg} tone="cream">
                <a
                  className={styles.sideRow}
                  href={project.url}
                  rel="noreferrer"
                  target="_blank"
                  title={project.title}
                >
                  <span
                    aria-hidden="true"
                    className={styles.sideMark}
                    data-role="side-project-mark"
                    data-tone={markTone}
                  >
                    <Image
                      alt=""
                      cover={true}
                      height={project.mark.height}
                      sizes={MARK_SIZES}
                      url={project.mark.url}
                      width={project.mark.width}
                    />
                  </span>
                  <span className={styles.sideText}>
                    <b className={styles.sideTitle}>{project.title}</b>
                    <span className={styles.sideDescription}>{project.description}</span>
                  </span>
                  <span aria-hidden="true" className={styles.sideArrow}>
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
