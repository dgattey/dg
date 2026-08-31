import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';
import { CollageProjectFrame } from '../collage/CollageProjectFrame';
import type { ProjectFrameStyle } from '../collage/workSheetFrames';

type ClassicProjectCardProps = RenderableProject & {
  surface?: 'classic';
};

type CollageProjectCardProps = RenderableProject & {
  className?: string;
  'data-work-slot'?: 'c1' | 'ws';
  style: ProjectFrameStyle;
  surface: 'collage';
};

type ProjectCardProps = ClassicProjectCardProps | CollageProjectCardProps;

const { gridItemSize } = getShape();
const smallMaxHeight = gridItemSize?.(0.75);

const projectCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: smallMaxHeight ?? 'unset' },
};

function ClassicProjectCard({ title, layout, link, thumbnail }: RenderableProject) {
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(
    layout ?? undefined,
  );

  return (
    <ContentCard
      horizontalSpan={horizontalSpan}
      link={link ?? undefined}
      overlay={title}
      sx={projectCardSx}
      verticalSpan={verticalSpan}
    >
      <Image
        alt={title}
        cover={true}
        height={height}
        sizes={sizes}
        url={thumbnail.url}
        width={width}
      />
    </ContentCard>
  );
}

export function ProjectCard(props: ProjectCardProps) {
  if (props.surface === 'collage') {
    const { className, style, surface: _surface, 'data-work-slot': workSlot, ...project } = props;
    return (
      <CollageProjectFrame
        className={className}
        data-work-slot={workSlot}
        project={project}
        style={style}
      />
    );
  }

  return <ClassicProjectCard {...props} />;
}
