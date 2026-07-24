import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';

type GatteySitesCardProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

const markSx: SxObject = {
  flexShrink: 0,
  height: 40,
  overflow: 'hidden',
  width: 40,
};

const cardSx: SxObject = {
  padding: 2.5,
};

const layoutSx: SxObject = {
  gap: 1,
  height: '100%',
  justifyContent: 'space-between',
};

const projectListSx: SxObject = {
  '& > li + li': {
    borderTop: '1px solid var(--mui-palette-card-border)',
  },
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const projectLinkSx: SxObject = {
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: 2,
  },
  '&:hover': {
    backgroundColor: 'var(--mui-palette-action-hover)',
    textDecoration: 'none',
  },
  alignItems: 'center',
  borderRadius: 1,
  display: 'flex',
  gap: 1.5,
  marginInline: -1,
  padding: 1,
  textDecoration: 'none',
  transition: 'background-color 160ms ease',
};

const projectTextSx: SxObject = {
  flex: 1,
  minWidth: 0,
};

const projectDescriptionSx: SxObject = {
  ...truncated(2),
};

const arrowSx: SxObject = {
  color: 'text.secondary',
  flexShrink: 0,
};

const markSizes = {
  extraLarge: 40,
} as const;

/**
 * Mid-grid collection of independently linked side projects.
 */
export function GatteySitesCard({ projects }: GatteySitesCardProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <ContentCard sx={cardSx}>
      <Stack sx={layoutSx}>
        <Typography component="h2" variant="overline">
          Side projects
        </Typography>
        <Stack component="ul" sx={projectListSx}>
          {projects.map(({ description, mark, title, url }) => (
            <Box component="li" key={url}>
              <Link href={url} isExternal={true} sx={projectLinkSx} title={title} underline="none">
                <Box aria-hidden="true" sx={markSx}>
                  <Image
                    alt=""
                    cover={true}
                    height={mark.height}
                    sizes={markSizes}
                    url={mark.url}
                    width={mark.width}
                  />
                </Box>
                <Stack sx={projectTextSx}>
                  <Typography component="span" variant="h6">
                    {title}
                  </Typography>
                  <Typography component="span" sx={projectDescriptionSx} variant="body2">
                    {description}
                  </Typography>
                </Stack>
                <Box aria-hidden="true" sx={arrowSx}>
                  <ArrowUpRight size={18} />
                </Box>
              </Link>
            </Box>
          ))}
        </Stack>
      </Stack>
    </ContentCard>
  );
}
