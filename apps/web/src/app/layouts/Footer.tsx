import { favoriteAlbumsRoute, homeRoute, musicRoute } from '@dg/shared-core/routes/app';
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
import { cacheLife } from 'next/cache';
import type { ReactNode } from 'react';
import { getFooterContent } from '../../services/contentful';
import { getLastKnownSong } from '../../services/spotify';
import { getLatestActivity } from '../../services/strava';
import { getAppVersionInfo } from '../../services/version';
import { FooterEmailAction } from './FooterEmailAction';
import { FooterNowStrip } from './FooterNowStrip';

const CHAR_CODE_SHIFT = 7;

const DEFAULT_ENCODED_EMAIL: ReadonlyArray<number> = [
  107, 128, 115, 104, 117, 71, 110, 104, 123, 123, 108, 128, 53, 106, 118, 116,
];

function encodeEmailToShiftedCodes(email: string): Array<number> {
  return Array.from(email, (ch) => ch.charCodeAt(0) + CHAR_CODE_SHIFT);
}

// biome-ignore lint/suspicious/useAwait: 'use cache' requires async
async function getCopyrightYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

function formatElsewhereHandle(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/$/, '');
    return `${host}${pathname}`;
  } catch {
    return rawUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}

function renderLedgerIcon(icon: string | null | undefined): ReactNode {
  switch (icon) {
    case 'cursor':
      return <CursorIcon size="20px" />;
    case 'github':
      return <FaIcon icon={faGithub} size="20px" />;
    case 'strava':
      return <FaIcon icon={faStrava} size="20px" />;
    case 'spotify':
      return <FaIcon icon={faSpotify} size="20px" />;
    case 'instagram':
      return <FaIcon icon={faInstagram} size="20px" />;
    case 'x':
      return <FaIcon icon={faXTwitter} size="20px" />;
    case 'linkedin':
      return <FaIcon icon={faLinkedinIn} size="20px" />;
    default:
      return null;
  }
}

export async function Footer() {
  const [footerContent, versionInfo, currentYear, lastKnownSong, latestActivity] =
    await Promise.all([
      getFooterContent(),
      getAppVersionInfo(),
      getCopyrightYear(),
      getLastKnownSong(),
      getLatestActivity(),
    ]);

  const emailLink = footerContent.links.find(
    (link) => link.icon === 'email' || link.url.startsWith('mailto:'),
  );
  const encodedEmail = emailLink
    ? encodeEmailToShiftedCodes(emailLink.url.replace(/^mailto:/i, ''))
    : DEFAULT_ENCODED_EMAIL;

  const elsewhereLinks = footerContent.links.filter(
    (link) => link.icon !== 'email' && !link.url.startsWith('mailto:'),
  );
  const { releaseUrl, version } = versionInfo;

  return (
    <footer className="chrome__footer">
      <FooterNowStrip initialTrack={lastKnownSong} latestActivity={latestActivity} />
      <div className="collageMeasure chrome__footerBody">
        <div className="chrome__footerGrid">
          <div className="chrome__helloCol">
            <p className="chrome__footerLabel">Say hello</p>
            {footerContent.description ? (
              <div className="chrome__helloDescription">
                <RichText {...footerContent.description} />
              </div>
            ) : null}
            <FooterEmailAction encodedEmail={encodedEmail} />
          </div>
          <div className="chrome__elsewhereCol">
            <p className="chrome__footerLabel chrome__elsewhereLabel">Elsewhere</p>
            {elsewhereLinks.length > 0 ? (
              <div className="chrome__ledger">
                {elsewhereLinks.map((link) => {
                  const displayTitle = link.title === 'Github' ? 'GitHub' : link.title;
                  const handle = formatElsewhereHandle(link.url);
                  return (
                    <a
                      aria-label={displayTitle}
                      className="chrome__ledgerRow"
                      href={link.url}
                      key={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span aria-hidden="true" className="chrome__ledgerIcon">
                        {renderLedgerIcon(link.icon)}
                      </span>
                      <span className="chrome__ledgerTitle">{displayTitle}</span>
                      <span aria-hidden="true" className="chrome__ledgerHandle">
                        {handle}
                      </span>
                      <svg
                        aria-hidden="true"
                        className="chrome__ledgerArrow"
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
            <span>© {currentYear} Dylan Gattey</span>
            {version ? (
              releaseUrl ? (
                <a
                  className="chrome__colophonVersion"
                  href={releaseUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={`GitHub release ${version}`}
                >
                  {version}
                </a>
              ) : (
                <span>{version}</span>
              )
            ) : null}
          </div>
          <nav aria-label="Footer navigation" className="chrome__colophonGroup chrome__colophonNav">
            <PageTransitionLink className="chrome__colophonLink" href={homeRoute} title="Home">
              Home
            </PageTransitionLink>
            <PageTransitionLink className="chrome__colophonLink" href={musicRoute} title="Music">
              Music
            </PageTransitionLink>
            <PageTransitionLink
              className="chrome__colophonLink"
              href={favoriteAlbumsRoute}
              title="Favorite albums"
            >
              Favorite albums
            </PageTransitionLink>
            <a className="chrome__colophonTop" href="#top">
              Back to top ↑
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
