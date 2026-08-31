import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { Image } from '@dg/ui/dependent/Image';
import styles from './home.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { paperToneVars } from './paperVars';
import type { PaperTone } from './types';

export function CollageSideProjects({
  projects,
}: {
  projects: ReadonlyArray<RenderableSideProject>;
}) {
  return (
    <div className={styles.sideRoot} data-slot="sd" style={{ gridArea: 'sd', marginTop: 6 }}>
      <h2 className={styles.sideHeadingWrap}>
        <PaperTag className="collageEyebrow" edge="quad-c" tiltDeg={-3} tone="vermilion">
          Side projects
        </PaperTag>
      </h2>
      <ul className={styles.sideList}>
        {projects.map((project, index) => {
          const even = index % 2 === 0;
          const markTone = (even ? 'ochre' : 'ultramarine') satisfies PaperTone;
          return (
            <li className={styles.sideItem} key={project.url}>
              <PaperCard
                className={`${styles.sideRowWrap} collageLift`}
                edge={even ? 'quad-a' : 'quad-d'}
                tiltDeg={even ? 1.5 : -1.2}
                tone="cream"
              >
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
                    style={paperToneVars(markTone)}
                  >
                    <Image
                      alt=""
                      cover={true}
                      height={project.mark.height}
                      sizes={{ extraLarge: 44 }}
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
