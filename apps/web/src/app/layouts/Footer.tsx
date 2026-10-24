import { changelogRoute, siteMapRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { CursorIcon } from '@dg/ui/dependent/Link';
import { RichText } from '@dg/ui/dependent/RichText';
import {
  FaIcon,
  faGithub,
  faInstagram,
  faLinkedinIn,
  faSpotify,
  faStrava,
  faXTwitter,
} from '@dg/ui/icons/FaIcon';
import type { ReactNode } from 'react';
import { getFooterContent } from '../../services/contentful';
import { getServerTime } from '../../services/getServerTime';
import { getLastKnownSong } from '../../services/spotify';
import { getLatestActivity } from '../../services/strava';
import { getAppVersionInfo } from '../../services/version';
import { PaperTag } from '../collage/PaperTag';
import { FooterEmailAction } from './FooterEmailAction';
import { FooterNowStrip } from './FooterNowStrip';
import { FooterRevealScroll } from './FooterRevealScroll';
import { FOOTER_DESTINATIONS } from './musicHeaderDestinations';

const CHAR_CODE_SHIFT = 7;

function encodeEmailToShiftedCodes(email: string): Array<number> {
  return Array.from(email, (ch) => ch.charCodeAt(0) + CHAR_CODE_SHIFT);
}

function renderElsewhereIcon(icon: string | null | undefined): ReactNode {
  switch (icon) {
    case 'cursor':
      return <CursorIcon size="18px" />;
    case 'github':
      return <FaIcon icon={faGithub} size="18px" />;
    case 'strava':
      return <FaIcon icon={faStrava} size="18px" />;
    case 'spotify':
      return <FaIcon icon={faSpotify} size="18px" />;
    case 'instagram':
      return <FaIcon icon={faInstagram} size="18px" />;
    case 'x':
      return <FaIcon icon={faXTwitter} size="18px" />;
    case 'linkedin':
      return <FaIcon icon={faLinkedinIn} size="18px" />;
    default:
      return null;
  }
}

export function formatElsewhereHandle(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/\?.*$/, '')
    .replace(/\/$/, '');
}

export async function Footer() {
  const [footerContent, versionInfo, serverTime, lastKnownSong, latestActivity] = await Promise.all(
    [
      getFooterContent(),
      getAppVersionInfo(),
      getServerTime(),
      getLastKnownSong(),
      getLatestActivity(),
    ],
  );

  const emailLink = footerContent.links.find(
    (link) => link.icon === 'email' || link.url.startsWith('mailto:'),
  );
  const encodedEmail = emailLink
    ? encodeEmailToShiftedCodes(emailLink.url.replace(/^mailto:/i, ''))
    : null;

  const elsewhereLinks = footerContent.links.filter(
    (link) => link.icon !== 'email' && !link.url.startsWith('mailto:'),
  );
  const { version } = versionInfo;

  const footerActivity = latestActivity
    ? {
        distance: latestActivity.distance,
        name: latestActivity.name,
        url: latestActivity.url,
      }
    : null;

  return (
    <footer className="chrome__footer">
      <FooterRevealScroll />
      <FooterNowStrip initialTrack={lastKnownSong} latestActivity={footerActivity} />
      <div className="collageMeasure chrome__footerBody">
        <div className="chrome__footerGrid">
          <div className="chrome__helloCol">
            <PaperTag className="chrome__footerTag" edge="quad-c" tiltDeg={-1} tone="ochre">
              Say hello
            </PaperTag>
            {footerContent.description ? (
              <div className="chrome__helloDescription">
                <RichText {...footerContent.description} />
              </div>
            ) : null}
            {encodedEmail ? <FooterEmailAction encodedEmail={encodedEmail} /> : null}
          </div>
          <div className="chrome__elsewhereCol">
            <PaperTag className="chrome__footerTag" edge="quad-b" tiltDeg={1} tone="cream">
              Elsewhere
            </PaperTag>
            {elsewhereLinks.length > 0 ? (
              <div className="chrome__elsewhereLedger">
                {elsewhereLinks.map((link) => {
                  const handle = formatElsewhereHandle(link.url);
                  return (
                    <a
                      aria-label={link.title}
                      className="chrome__elsewhereRow"
                      href={link.url}
                      key={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span aria-hidden="true" className="chrome__elsewhereIcon">
                        {renderElsewhereIcon(link.icon)}
                      </span>
                      <span className="chrome__elsewhereTitle">{link.title}</span>
                      <span className="chrome__elsewhereHandle">{handle}</span>
                      <svg
                        aria-hidden="true"
                        className="chrome__elsewhereArrow"
                        fill="none"
                        height={16}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                        width={16}
                      >
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className="chrome__colophon">
          <div className="chrome__colophonGroup">
            <span>© {new Date(serverTime).getFullYear()} Dylan Gattey</span>
            {version ? (
              <PageTransitionLink
                className="chrome__colophonVersion"
                href={changelogRoute}
                title={version}
              >
                {version}
              </PageTransitionLink>
            ) : null}
            <PageTransitionLink
              className="chrome__colophonVersion"
              href={siteMapRoute}
              title="Site map"
            >
              Site map
            </PageTransitionLink>
          </div>
          <nav aria-label="Footer navigation" className="chrome__colophonGroup">
            {FOOTER_DESTINATIONS.map((destination) => (
              <PageTransitionLink
                className="chrome__colophonLink"
                href={destination.href}
                key={destination.href}
                title={destination.label}
              >
                {destination.label}
              </PageTransitionLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
