import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

type SideProject = {
  description: string;
  mark: ReactNode;
  title: string;
  url: string;
};

const markSx: SxObject = {
  flexShrink: 0,
  height: 40,
  width: 40,
};

function WmmMark() {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      sx={markSx}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#9d915c" height="24" rx="2" width="10" x="4" y="4" />
      <rect fill="#4eaca8" height="9" rx="2" width="13" x="15" y="4" />
      <rect fill="#aa559c" height="14" rx="2" width="6" x="15" y="14" />
      <rect fill="#70a25d" height="14" rx="2" width="6" x="22" y="14" />
    </Box>
  );
}

function LostMark() {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      fill="none"
      sx={markSx}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" fill="#090909" r="16" />
      <g
        stroke="#f59e0b"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.75"
        transform="translate(16 16) scale(0.7) translate(-12 -12)"
      >
        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
      </g>
    </Box>
  );
}

const SIDE_PROJECTS = [
  {
    description: 'See what you own and where it sits',
    mark: <WmmMark />,
    title: 'WMM',
    url: 'https://wmm.gattey.com',
  },
  {
    description: 'Score Lost Cities by photo or manual entry',
    mark: <LostMark />,
    title: 'Lost Cities scorer',
    url: 'https://lostcities.app',
  },
] satisfies ReadonlyArray<SideProject>;

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

/**
 * Mid-grid collection of independently linked side projects.
 */
export function GatteySitesCard() {
  return (
    <ContentCard sx={cardSx}>
      <Stack sx={layoutSx}>
        <Typography component="h2" variant="overline">
          Side projects
        </Typography>
        <Stack component="ul" sx={projectListSx}>
          {SIDE_PROJECTS.map(({ description, mark, title, url }) => (
            <Box component="li" key={url}>
              <Link href={url} isExternal={true} sx={projectLinkSx} title={title} underline="none">
                {mark}
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
