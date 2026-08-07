import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';

type GatteySitesCardProps = {
  projects: ReadonlyArray<RenderableSideProject>;
};

const MARK_ROLE = 'side-project-mark';

/**
 * Rows sit 13px inside the card: 20px of card padding plus its 1px border, less
 * the 8px each row bleeds back out. Keeping their corners concentric with the
 * card's 32px radius means subtracting that gap.
 */
const ROW_BORDER_RADIUS = '19px';

const markSx: SxObject = {
  flexShrink: 0,
  height: 40,
  overflow: 'hidden',
  transform: 'scale(1)',
  width: 40,
  ...createBouncyTransition('transform'),
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
  // Hide the shared divider when either adjacent row is hovered.
  '& > li:hover': {
    borderTopColor: 'transparent',
  },
  '& > li:hover + li': {
    borderTopColor: 'transparent',
  },
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const projectLinkSx: SxObject = {
  [`&:hover [data-role="${MARK_ROLE}"], &:focus-visible [data-role="${MARK_ROLE}"]`]: {
    transform: 'scale(1.1)',
  },
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: 2,
  },
  '&:hover': {
    backgroundColor: 'var(--mui-palette-action-hover)',
    textDecoration: 'none',
  },
  alignItems: 'center',
  borderRadius: ROW_BORDER_RADIUS,
  display: 'flex',
  gap: 1.5,
  marginInline: -1,
  padding: 1,
  textDecoration: 'none',
  ...createBouncyTransition('background-color'),
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
                <Box aria-hidden="true" data-role={MARK_ROLE} sx={markSx}>
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
