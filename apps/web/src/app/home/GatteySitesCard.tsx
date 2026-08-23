import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import { getConcentricBorderRadius } from '@dg/ui/helpers/concentricBorderRadius';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';

type GatteySitesCardVariant = 'list' | 'rows';

type GatteySitesCardProps = {
  projects: ReadonlyArray<RenderableSideProject>;
  /**
   * `list` is flag-off (h6 / body2). `rows` matches greenhouse music list
   * rows (h5 / caption).
   */
  variant?: GatteySitesCardVariant;
};

const TITLE_VARIANT = {
  list: 'h6',
  rows: 'h5',
} as const;

const DESCRIPTION_VARIANT = {
  list: 'body2',
  rows: 'caption',
} as const;

const MARK_ROLE = 'side-project-mark';

const CARD_PADDING_PX = 20;
const CARD_BORDER_WIDTH_PX = 1;
const ROW_BLEED_PX = 8;
const ROW_INSET_PX = CARD_PADDING_PX + CARD_BORDER_WIDTH_PX - ROW_BLEED_PX;
const { cardBorderRadius } = getShape();
const ROW_BORDER_RADIUS = getConcentricBorderRadius(cardBorderRadius, ROW_INSET_PX);

const markSx: SxObject = {
  flexShrink: 0,
  height: 40,
  overflow: 'hidden',
  transform: 'scale(1)',
  width: 40,
  ...createBouncyTransition('transform'),
};

const cardSx: SxObject = {
  padding: `${CARD_PADDING_PX}px`,
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
  marginInline: `-${ROW_BLEED_PX}px`,
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
export function GatteySitesCard({ projects, variant = 'list' }: GatteySitesCardProps) {
  if (projects.length === 0) {
    return null;
  }

  const titleVariant = TITLE_VARIANT[variant];
  const descriptionVariant = DESCRIPTION_VARIANT[variant];

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
                  <Typography component="span" variant={titleVariant}>
                    {title}
                  </Typography>
                  <Typography
                    component="span"
                    sx={projectDescriptionSx}
                    variant={descriptionVariant}
                  >
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
