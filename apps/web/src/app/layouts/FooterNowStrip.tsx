'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { FaIcon, faStrava } from '@dg/ui/icons/FaIcon';
import { useEffect, useState } from 'react';
import { useNowPlaying } from '../spotify/NowPlayingContext';
import { PlaybackStatusText } from '../spotify/PlaybackStatusText';

const sfTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: SITE_TIME_ZONE,
});

function formatSfTime(timestamp: number): string {
  return sfTimeFormatter.format(new Date(timestamp));
}

type FooterActivitySummary = Pick<StravaActivity, 'distance' | 'name' | 'url'>;

type FooterNowStripProps = {
  initialTrack: Track | null;
  latestActivity: FooterActivitySummary | null;
};

export function FooterNowStrip({ initialTrack, latestActivity }: FooterNowStripProps) {
  const track = useNowPlaying(initialTrack);
  const serverTime = useServerTime();
  const [sfTime, setSfTime] = useState(() => formatSfTime(serverTime));

  useEffect(() => {
    const update = () => setSfTime(formatSfTime(Date.now()));
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const rawDistance =
    latestActivity?.distance !== null && latestActivity?.distance !== undefined
      ? formattedDistance({ distanceInMeters: latestActivity.distance })
      : null;
  const rideDistance = rawDistance ? rawDistance.replace(/ miles$/, ' mi') : null;
  const trackSummary = track
    ? `${track.name} · ${track.artists.map((artist) => artist.name).join(', ')}`
    : null;
  const rideSummary = latestActivity
    ? [latestActivity.name, rideDistance].filter(Boolean).join(' · ')
    : null;

  return (
    <div className="collageMeasure chrome__nowWrap">
      <section aria-label="Live status" className="chrome__nowStrip">
        <div className="chrome__nowCell chrome__nowCellLead">
          <span aria-hidden="true" className="chrome__nowLive" />
          <span className="chrome__nowKey" data-typography="row-title">
            Now
          </span>
        </div>
        {track ? (
          <Tooltip className="chrome__nowTip" placement="top" title={trackSummary} whenTruncated>
            <a
              className="chrome__nowCell chrome__nowCellLink"
              href={track.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {track.albumImage?.url ? (
                <Image
                  alt=""
                  className="chrome__nowArtImg"
                  height={28}
                  sizes={{ extraLarge: 28 }}
                  url={track.albumImage.url}
                  width={28}
                />
              ) : (
                <span aria-hidden="true" className="chrome__nowArtFallback">
                  <span />
                </span>
              )}
              <span className="chrome__nowKey" data-typography="meta">
                <PlaybackStatusText
                  hasTooltip={false}
                  isPlaying={track.isPlaying}
                  playedAt={track.playedAt}
                />
              </span>
              <span className="chrome__nowValue" data-typography="row-title">
                {trackSummary}
              </span>
            </a>
          </Tooltip>
        ) : null}
        {latestActivity ? (
          <Tooltip
            className="chrome__nowTip chrome__nowTipRide"
            placement="top"
            title={rideSummary}
            whenTruncated
          >
            <a
              className="chrome__nowCell chrome__nowCellLink"
              href={latestActivity.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span aria-hidden="true" className="chrome__nowStrava">
                <FaIcon icon={faStrava} size="16px" />
              </span>
              <span className="chrome__nowKey" data-typography="meta">
                Last ride
              </span>
              <span className="chrome__nowValue" data-typography="row-title">
                {rideSummary}
              </span>
            </a>
          </Tooltip>
        ) : null}
        <div className="chrome__nowCell chrome__nowCellLast">
          <span className="chrome__nowKey chrome__nowCityFull" data-typography="meta">
            San Francisco
          </span>
          <span
            aria-hidden="true"
            className="chrome__nowKey chrome__nowCityShort"
            data-typography="meta"
          >
            SF ·
          </span>
          <span className="chrome__nowValue" data-typography="row-title" data-typography-md="meta">
            {sfTime}
          </span>
        </div>
      </section>
    </div>
  );
}
