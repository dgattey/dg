import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { Link } from '@dg/ui/dependent/Link';
import { cacheLife } from 'next/cache';
import { getFooterLinks } from '../../services/contentful';
import { getAppVersionInfo } from '../../services/version';
import { PaperCard } from '../collage/PaperCard';

// biome-ignore lint/suspicious/useAwait: 'use cache' requires async
async function getCopyrightYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

export async function Footer() {
  const [footerLinks, versionInfo, currentYear] = await Promise.all([
    getFooterLinks(),
    getAppVersionInfo(),
    getCopyrightYear(),
  ]);
  const nonIconFooterLinks = footerLinks.filter((link) => !link.icon);
  const iconFooterLinks = footerLinks.filter((link) => link.icon);
  const { releaseUrl, version } = versionInfo;

  return (
    <footer className="chrome__footer">
      <PaperCard className="collageMeasure" edge="soft-b" tiltDeg={-0.5} tone="black">
        <div className="chrome__stripInner">
          <div className="chrome__stripMeta">
            <span>© {currentYear} Dylan Gattey</span>
            {version ? (
              <>
                <span className="chrome__dot">•</span>
                {releaseUrl ? (
                  <Link
                    href={releaseUrl}
                    isExternal
                    title={`GitHub release ${version}`}
                    variant="caption"
                  >
                    {version}
                  </Link>
                ) : (
                  version
                )}
              </>
            ) : null}
            {process.env.NODE_ENV !== 'production' ? (
              <>
                <span className="chrome__dot">•</span>
                <Link forcePageNavigation href={devConsoleRoute} title="Developer tools">
                  Dev console
                </Link>
              </>
            ) : null}
          </div>
          <div className="chrome__links">
            {[...nonIconFooterLinks, ...iconFooterLinks].map((link) => (
              <Link
                href={link.url}
                icon={link.icon ?? undefined}
                isExternal={link.url.startsWith('http')}
                key={link.url}
                layout="icon"
                title={link.title}
                tooltipPlacement="top"
              />
            ))}
          </div>
        </div>
      </PaperCard>
    </footer>
  );
}
