import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import type { ImageSizes } from '@dg/ui/dependent/Image';
import { Image } from '@dg/ui/dependent/Image';
import styles from './CollageSideProjects.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import type { PaperTone } from './types';

type CollageSideProjectsProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

const MARK_SIZES: ImageSizes = {
  extraLarge: 44,
};

const MARK_TONES: ReadonlyArray<PaperTone> = ['ochre', 'ultramarine'];

const ROW_EDGES = ['quad-a', 'quad-d'] as const;

export function CollageSideProjects({ projects }: CollageSideProjectsProps) {
  return (
    <div className={styles.root} data-slot="sd">
      <h2 className={styles.headingWrap}>
        <PaperTag className={styles.heading} edge="quad-c" tiltDeg={-3} tone="vermilion">
          Side projects
        </PaperTag>
      </h2>
      <ul className={styles.list}>
        {projects.map((project, index) => {
          const markTone = MARK_TONES[index % MARK_TONES.length] ?? 'ochre';
          const edge = ROW_EDGES[index % ROW_EDGES.length] ?? 'quad-a';
          const tiltDeg = index % 2 === 0 ? 1.5 : -1.2;
          return (
            <li className={styles.item} key={project.url}>
              <PaperCard className={styles.rowWrap} edge={edge} tiltDeg={tiltDeg} tone="cream">
                <a
                  className={styles.row}
                  href={project.url}
                  rel="noreferrer"
                  target="_blank"
                  title={project.title}
                >
                  <span
                    aria-hidden="true"
                    className={styles.mark}
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
                  <span className={styles.text}>
                    <b className={styles.title}>{project.title}</b>
                    <span className={styles.description}>{project.description}</span>
                  </span>
                  <span aria-hidden="true" className={styles.arrow}>
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
