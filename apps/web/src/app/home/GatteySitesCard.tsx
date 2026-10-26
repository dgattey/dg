'use client';

import type {
  RenderableSideProject,
  SideProjectMark as SideProjectMarkAsset,
} from '@dg/content-models/contentful/renderables/sideProjects';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';

/** Neighbours never share an angle, so the stack reads as hand-placed paper. */
const ROW_TILTS = [-1.6, 1.4, -1.9, 1.5, -1.3] as const;

type GatteySitesCardProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

function trimTransparentMargin(img: HTMLImageElement) {
  const { naturalHeight: height, naturalWidth: width } = img;
  if (width === 0 || height === 0) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if ((data[(y * width + x) * 4 + 3] ?? 0) > 200) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return;
    const ratio = Math.max(maxX - minX + 1, maxY - minY + 1) / Math.max(width, height);
    if (ratio > 0 && ratio < 0.96) {
      img.style.setProperty('--mark-scale', (1 / ratio).toFixed(3));
    }
  } catch {}
}

function syncMarkScale(node: HTMLSpanElement | null) {
  const img = node?.querySelector('img');
  if (!img) return;
  const apply = () => trimTransparentMargin(img);
  if (img.complete && img.naturalWidth > 0) {
    apply();
    return;
  }
  img.addEventListener('load', apply, { once: true });
}

export function SideProjectMark({
  className,
  mark,
}: {
  className?: string;
  mark: SideProjectMarkAsset;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      data-role="side-project-mark"
      ref={syncMarkScale}
    >
      <Image
        alt=""
        height={mark.height}
        sizes={{ extraLarge: 88 }}
        url={mark.url}
        width={mark.width}
      />
    </span>
  );
}

export function GatteySitesCard({ projects }: GatteySitesCardProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="home__sideRoot" data-slot="sd">
      <h2 className="home__sideHeadingWrap">
        <PaperTag className="collageEyebrow" edge="quad-c" tiltDeg={-3} tone="vermilion">
          Side projects
        </PaperTag>
      </h2>
      <ul className="home__sideList">
        {projects.map((project, index) => (
          <li className="home__sideItem" key={project.url}>
            <PaperCard
              className="home__sideRowWrap collageLift"
              tiltDeg={ROW_TILTS[index % ROW_TILTS.length]}
              tone="cream"
            >
              <a className="home__sideRow" href={project.url} rel="noreferrer" target="_blank">
                <SideProjectMark className="home__sideMark" mark={project.mark} />
                <span className="home__sideText">
                  <b data-typography="title-sm" data-typography-lg="meta">
                    {project.title}
                  </b>
                  <Tooltip title={project.description} whenTruncated>
                    <span className="home__sideDescription" data-typography="caption">
                      {project.description}
                    </span>
                  </Tooltip>
                </span>
                <span aria-hidden="true" data-typography="title-sm">
                  ↗
                </span>
              </a>
            </PaperCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
