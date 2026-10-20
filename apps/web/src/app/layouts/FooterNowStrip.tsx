'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { useServerTime } from '@dg/ui/core/ServerTimeContext';
import { FaIcon, faStrava } from '@dg/ui/icons/FaIcon';
import { useEffect, useState } from 'react';
import { useNowPlaying } from '../spotify/NowPlayingContext';

const sfTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Los_Angeles',
});

function formatSfTime(timestamp: number): string {
  return sfTimeFormatter.format(new Date(timestamp));
}

type FooterNowStripProps = {
  initialTrack: Track | null;
  latestActivity: StravaActivity | null;
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

  return (
    <div className="collageMeasure chrome__nowWrap">
      <section aria-label="Live status" className="chrome__nowStrip">
        <div className="chrome__nowCell chrome__nowCellLead">
          <span aria-hidden="true" className="chrome__nowLive" />
          <span className="chrome__nowKey">Now</span>
        </div>
        {track ? (
          <a
            className="chrome__nowCell chrome__nowCellLink"
            href={track.externalUrls.spotify}
            rel="noopener noreferrer"
            target="_blank"
          >
            {track.albumImage?.url ? (
              // biome-ignore lint/performance/noImgElement: 28px Spotify CDN thumbnail in status bar
              <img
                alt=""
                className="chrome__nowArtImg"
                height={28}
                loading="lazy"
                src={track.albumImage.url}
                width={28}
              />
            ) : (
              <span aria-hidden="true" className="chrome__nowArtFallback">
                <span />
              </span>
            )}
            <span className="chrome__nowKey">Playing</span>
            <span className="chrome__nowValue">
              {track.name} · {track.artists.map((artist) => artist.name).join(', ')}
            </span>
          </a>
        ) : null}
        {latestActivity ? (
          <a
            className="chrome__nowCell chrome__nowCellLink"
            href={latestActivity.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span aria-hidden="true" className="chrome__nowStrava">
              <FaIcon icon={faStrava} size="16px" />
            </span>
            <span className="chrome__nowKey">Last ride</span>
            <span className="chrome__nowValue">
              {rideDistance ? `${latestActivity.name} · ${rideDistance}` : latestActivity.name}
            </span>
          </a>
        ) : null}
        <div className="chrome__nowCell chrome__nowCellLast">
          <span className="chrome__nowKey chrome__nowCityFull">San Francisco</span>
          <span aria-hidden="true" className="chrome__nowKey chrome__nowCityShort">
            SF ·
          </span>
          <span className="chrome__nowValue">{sfTime}</span>
        </div>
      </section>
    </div>
  );
}
