import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { ImageSizes } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import styles from './CollageProjectFrame.module.css';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { Print } from './Print';
import type { ProjectFrameStyle } from './workSheetFrames';
import { projectFrameAspectRatio, projectTagMeta } from './workSheetFrames';

const PROJECT_SIZES: ImageSizes = {
  extraLarge: 760,
  large: 760,
  medium: 760,
  small: 380,
  tiny: 380,
};

type CollageProjectFrameProps = {
  className?: string;
  'data-work-slot'?: 'c1' | 'ws';
  project: RenderableProject;
  style: ProjectFrameStyle;
};

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined && value.length > 0).join(' ');
}

export function CollageProjectFrame({
  className,
  'data-work-slot': workSlot,
  project,
  style,
}: CollageProjectFrameProps) {
  const meta = projectTagMeta(project);
  const aspectRatio = projectFrameAspectRatio(project.layout);
  const printStyle = {
    '--ar': String(aspectRatio),
    '--d': style.printTone,
  } as CSSProperties;
  const href = project.link?.url;
  const tag = (
    <PaperTag
      className={classNames(styles.tag, styles[style.tagClassName])}
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
      className={styles.card}
      edge={style.edge}
      innerClassName={styles.frame}
      tiltDeg={style.tiltDeg}
      tone="cream"
    >
      <span className={styles.shot} style={printStyle}>
        <Print
          alt={project.title}
          className={styles.print}
          image={{
            height: project.thumbnail.height,
            title: project.title,
            url: project.thumbnail.url,
            width: project.thumbnail.width,
          }}
          quality={60}
          sizes={PROJECT_SIZES}
          treatment="project"
        />
      </span>
    </PaperCard>
  );

  if (!href) {
    return (
      <div className={classNames(styles.win, className)} data-work-slot={workSlot}>
        {frame}
        {tag}
      </div>
    );
  }

  return (
    <a
      className={classNames(styles.win, className)}
      data-work-slot={workSlot}
      href={href}
      rel="noreferrer"
      target="_blank"
      title={project.title}
    >
      {frame}
      {tag}
    </a>
  );
}
