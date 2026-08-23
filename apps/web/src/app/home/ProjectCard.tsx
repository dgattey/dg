import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { RichText } from '@dg/ui/dependent/RichText';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';
import { Box, Chip, Stack, Typography } from '@mui/material';

type ProjectCardVariant = 'media' | 'featured' | 'tile';

type ProjectCardProps = RenderableProject & {
  /**
   * Overline on the featured tile. First project is "Featured project".
   */
  eyebrow?: string;
  /**
   * `media` is today's thumbnail + overlay. `featured` fills the activity
   * row. `tile` is leftover greenhouse projects: same chrome, hug content.
   */
  variant?: ProjectCardVariant;
};

const { gridItemSize } = getShape();
const smallMaxHeight = gridItemSize?.(0.75);

const projectCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: smallMaxHeight ?? 'unset' },
};

const featuredCardSx: SxObject = {
  '& [data-project-mark] img': {
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    width: '100%',
  },
  boxSizing: 'border-box',
  containerType: 'inline-size',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 'none',
  minHeight: { sm: '13.5rem', xs: 'auto' },
  minWidth: 0,
  padding: 2.25,
  width: '100%',
};

const tileCardSx: SxObject = {
  '[data-greenhouse-frame] &[data-bento="project"]': {
    height: 'auto !important',
    minHeight: 'auto',
  },
  minHeight: 'auto',
};

const featuredLayoutSx: SxObject = {
  flex: '1 1 auto',
  gap: 1.25,
  justifyContent: 'space-between',
  minWidth: 0,
  width: '100%',
};

const tileLayoutSx: SxObject = {
  flex: '0 0 auto',
  justifyContent: 'flex-start',
};

const featuredCopySx: SxObject = {
  gap: 1,
  minWidth: 0,
  width: '100%',
};

const featuredTitleRowSx: SxObject = {
  '@container (max-width: 575px)': {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  alignItems: 'center',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  gap: 1.5,
  minWidth: 0,
  width: '100%',
};

const featuredTitleSx: SxObject = {
  flex: '1 1 auto',
  hyphens: 'none',
  minWidth: 0,
  overflowWrap: 'normal',
  whiteSpace: 'normal',
  wordBreak: 'normal',
};

const featuredIconSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 82%, transparent)',
  borderRadius: '0.85rem',
  flexShrink: 0,
  height: 52,
  overflow: 'hidden',
  position: 'relative',
  width: 52,
};

const featuredIconImgSx: SxObject = {
  display: 'block',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
  width: '100%',
};

const featuredBlurbSx: SxObject = {
  '& p': {
    margin: 0,
  },
};

const featuredTagsSx: SxObject = {
  alignItems: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 0.75,
  minWidth: 0,
  width: '100%',
};

const featuredChipSx: SxObject = {
  flexShrink: 0,
  maxWidth: '100%',
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

function hasRichText(json: unknown): boolean {
  if (!json || typeof json !== 'object') {
    return false;
  }
  const content = 'content' in json ? json.content : null;
  return Array.isArray(content) && content.length > 0;
}

function FeaturedIcon({ thumbnail }: { thumbnail: RenderableProject['thumbnail'] }) {
  if (thumbnail.url.startsWith('http')) {
    return (
      <Image
        alt=""
        fill={true}
        height={thumbnail.height}
        sizes={{ extraLarge: 52 }}
        url={thumbnail.url}
        width={thumbnail.width}
      />
    );
  }
  return <Box alt="" component="img" src={thumbnail.url} sx={featuredIconImgSx} />;
}

function FeaturedProjectCard({
  description,
  eyebrow = 'Featured project',
  link,
  thumbnail,
  title,
  type,
  variant,
}: RenderableProject & { eyebrow?: string; variant: 'featured' | 'tile' }) {
  const tags = projectTags(type);
  const descriptionJson = description?.json;
  const isTile = variant === 'tile';

  return (
    <ContentCard
      data-bento={isTile ? 'project' : 'featured'}
      sx={isTile ? { ...featuredCardSx, ...tileCardSx } : featuredCardSx}
    >
      <Stack sx={isTile ? { ...featuredLayoutSx, ...tileLayoutSx } : featuredLayoutSx}>
        <Stack sx={featuredCopySx}>
          <Typography color="text.secondary" variant="overline">
            {eyebrow}
          </Typography>
          <Stack sx={featuredTitleRowSx}>
            <Box data-project-mark="" sx={featuredIconSx}>
              <FeaturedIcon thumbnail={thumbnail} />
            </Box>
            <Typography component="h2" sx={featuredTitleSx} variant={isTile ? 'h4' : 'h3'}>
              {title}
            </Typography>
          </Stack>
          {hasRichText(descriptionJson) ? (
            <Box sx={featuredBlurbSx}>
              <RichText
                json={descriptionJson}
                links={emptyRichTextLinks}
                paragraphVariant="body2"
              />
            </Box>
          ) : null}
          {tags.length > 0 ? (
            <Stack sx={featuredTagsSx}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={featuredChipSx} />
              ))}
            </Stack>
          ) : null}
        </Stack>
        {link ? (
          <Link color="secondary" href={link.url} title={link.title} variant="caption">
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
export function ProjectCard({ eyebrow, variant = 'media', ...project }: ProjectCardProps) {
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(
    project.layout ?? undefined,
  );

  if (variant === 'featured' || variant === 'tile') {
    return <FeaturedProjectCard eyebrow={eyebrow} variant={variant} {...project} />;
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
