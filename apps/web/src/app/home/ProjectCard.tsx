import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';
import { Box, Chip, Stack, Typography } from '@mui/material';

type ProjectCardProps = RenderableProject & {
  /**
   * `media` is today's thumbnail + overlay. `featured` is the greenhouse
   * project tile: label, tags, and a text CTA.
   */
  variant?: 'media' | 'featured';
};

const { gridItemSize } = getShape();
const smallMaxHeight = gridItemSize?.(0.75);

const projectCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: smallMaxHeight ?? 'unset' },
};

const featuredCardSx: SxObject = {
  display: 'flex',
  height: '100%',
  minHeight: { md: '13.25rem', xs: 'auto' },
  padding: 2.25,
};

const featuredLayoutSx: SxObject = {
  flex: 1,
  gap: 1.5,
  justifyContent: 'space-between',
  minHeight: 0,
};

const featuredCopySx: SxObject = {
  gap: 1,
  minWidth: 0,
};

const featuredIconSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 82%, transparent)',
  borderRadius: '0.85rem',
  flexShrink: 0,
  height: 52,
  overflow: 'hidden',
  width: 52,
};

const featuredTagsSx: SxObject = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 0.75,
};

const featuredCtaSx: SxObject = {
  fontSize: '0.92rem',
  fontWeight: 600,
};

const emptyRichTextLinks = {
  assets: { block: [] },
  entries: { block: [], inline: [] },
};

function projectTags(type: RenderableProject['type']): Array<string> {
  if (Array.isArray(type)) {
    return type.filter((tag) => tag.length > 0);
  }
  return type ? [type] : [];
}

function FeaturedProjectCard({ description, link, thumbnail, title, type }: RenderableProject) {
  const tags = projectTags(type);
  const descriptionJson = description?.json;

  return (
    <ContentCard data-bento="featured" link={link ?? undefined} sx={featuredCardSx}>
      <Stack sx={featuredLayoutSx}>
        <Stack sx={featuredCopySx}>
          <Typography color="text.secondary" variant="overline">
            Featured project
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={featuredIconSx}>
              <Image
                alt=""
                cover={true}
                height={52}
                sizes={{ extraLarge: 52 }}
                url={thumbnail.url}
                width={52}
              />
            </Box>
            <Typography component="h2" variant="h5">
              {title}
            </Typography>
          </Stack>
          {descriptionJson ? <RichText json={descriptionJson} links={emptyRichTextLinks} /> : null}
          {tags.length > 0 ? (
            <Stack sx={featuredTagsSx}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Stack>
          ) : null}
        </Stack>
        {link ? (
          <Link color="secondary" href={link.url} sx={featuredCtaSx} title={link.title}>
            View project →
          </Link>
        ) : null}
      </Stack>
    </ContentCard>
  );
}

/**
 * Uses the `ContentCard` to show a project's details
 */
export function ProjectCard({ variant = 'media', ...project }: ProjectCardProps) {
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(
    project.layout ?? undefined,
  );

  if (variant === 'featured') {
    return <FeaturedProjectCard {...project} />;
  }

  return (
    <ContentCard
      horizontalSpan={horizontalSpan}
      link={project.link ?? undefined}
      overlay={project.title}
      sx={projectCardSx}
      verticalSpan={verticalSpan}
    >
      <Image
        alt={project.title}
        cover={true}
        height={height}
        sizes={sizes}
        url={project.thumbnail.url}
        width={width}
      />
    </ContentCard>
  );
}
