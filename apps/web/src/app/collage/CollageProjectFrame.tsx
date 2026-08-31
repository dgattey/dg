import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import styles from './home.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';
import printStyles from './print.module.css';
import { type ProjectFrameStyle, projectFrameAspectRatio, projectTagMeta } from './projectSlots';

export type CollageProjectSlot = 'c1' | 'cn' | 'gn' | 'js' | 'li' | 'mg' | 'ws';

export function CollageProjectFrame({
  className,
  'data-slot': dataSlot,
  project,
  style,
}: {
  className?: string;
  'data-slot'?: CollageProjectSlot;
  project: RenderableProject;
  style: ProjectFrameStyle;
}) {
  const meta = projectTagMeta(project);
  const printStyle: CSSProperties & Record<`--${string}`, string> = {
    '--ar': String(projectFrameAspectRatio(project.layout)),
    '--d': style.printTone,
  };
  const placementStyle: CSSProperties = {
    ...(dataSlot ? { gridArea: dataSlot } : {}),
    ...(style.marginTop != null ? { marginTop: style.marginTop } : {}),
  };
  const tag = (
    <PaperTag
      className={cx('collagePin', styles[style.tagClassName])}
      edge="quad-c"
      tiltDeg={style.tagTiltDeg}
      tone={style.tagTone}
    >
      <span>{project.title}</span>
      {meta ? <small>{meta}</small> : null}
    </PaperTag>
  );
  const frame = (
    <PaperCard
      className={styles.frameCard}
      edge={style.edge}
      innerClassName={styles.framePad}
      tiltDeg={style.tiltDeg}
      tone="cream"
    >
      <span className={styles.frameShot} style={printStyle}>
        <span className={cx(printStyles.print, printStyles.treatmentProject, styles.framePrint)}>
          <Image
            alt={project.title}
            cover={true}
            height={project.thumbnail.height}
            quality={60}
            sizes={{ extraLarge: 760, large: 760, medium: 760, small: 380, tiny: 380 }}
            url={project.thumbnail.url}
            width={project.thumbnail.width}
          />
        </span>
      </span>
    </PaperCard>
  );
  const shared = {
    className: cx(styles.frameWin, 'collageLift', className),
    'data-slot': dataSlot,
    style: placementStyle,
  };

  if (!project.link?.url) {
    return (
      <div {...shared}>
        {frame}
        {tag}
      </div>
    );
  }

  return (
    <a {...shared} href={project.link.url} rel="noreferrer" target="_blank" title={project.title}>
      {frame}
      {tag}
    </a>
  );
}
