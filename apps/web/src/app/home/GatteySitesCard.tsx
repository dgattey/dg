import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import type { ComponentType } from 'react';
import { PhotosSiteMark, WmmSiteMark } from './gatteySiteMarks';

type GatteySite = {
  description: string;
  Mark: ComponentType;
  title: string;
  url: string;
};

const SITES: Array<GatteySite> = [
  {
    description: 'Family gallery uploads and frame sync',
    Mark: PhotosSiteMark,
    title: 'Gattey Photos',
    url: 'https://photos.gattey.com',
  },
  {
    description: 'What you own, where it sits',
    Mark: WmmSiteMark,
    title: 'WMM',
    url: 'https://wmm.gattey.com',
  },
];

const cardSx: SxObject = {
  padding: 2.5,
};

const layoutStackSx: SxObject = {
  gap: 2,
  height: '100%',
  justifyContent: 'space-between',
};

const siteListSx: SxObject = {
  gap: 2,
};

const siteRowSx: SxObject = {
  alignItems: 'flex-start',
  flexDirection: 'row',
  gap: 1.5,
};

const markSx: SxObject = {
  flexShrink: 0,
  height: 40,
  width: 40,
};

const siteTitleSx: SxObject = {
  ...truncated(2),
  display: 'block',
  marginBottom: 1,
};

const siteDescriptionSx: SxObject = truncated(3);

/**
 * Mid-grid card linking out to other gattey.com project sites.
 * Uses StravaCard typography with site marks beside each entry.
 */
export function GatteySitesCard() {
  return (
    <ContentCard sx={cardSx}>
      <Stack sx={layoutStackSx}>
        <Typography component="h2" variant="overline">
          Also on gattey.com
        </Typography>
        <Stack sx={siteListSx}>
          {SITES.map(({ description, Mark, title, url }) => (
            <Stack key={url} sx={siteRowSx}>
              <Box sx={markSx}>
                <Mark />
              </Box>
              <Stack>
                <Link href={url} isExternal sx={siteTitleSx} title={title} variant="h5">
                  {title}
                </Link>
                <Link href={url} isExternal sx={siteDescriptionSx} title={title} variant="body2">
                  {description}
                </Link>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </ContentCard>
  );
}
