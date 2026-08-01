/**
 * Fails the build when a native `.node` addon is traced into a route's deployment bundle
 * without the shared libraries it dlopens.
 *
 * Next.js hands `@vercel/nft` the job of listing every file a route needs at runtime, and
 * Vercel builds each serverless function from those lists. nft finds `.node` addons through
 * ordinary `require` analysis, but it cannot see the ELF `DT_NEEDED` entries inside them, so
 * it leans on per-package special cases to pick up the matching shared object. When one of
 * those special cases stops matching, the deploy still succeeds and every request to the
 * affected route throws `ERR_DLOPEN_FAILED` instead.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { log } from '@dg/shared-core/logging/log';

const APP_TRACE_DIR = path.join(process.cwd(), '.next', 'server', 'app');

/** Matches an soname the way it appears verbatim in an addon's ELF string table. */
const SONAME_PATTERN = /lib[\w+-]*\.so(?:\.[0-9.]+)?/g;

type TraceFile = {
  /** Paths a route needs at runtime, relative to the directory holding the `.nft.json` */
  files: Array<string>;
};

type PackageJson = {
  optionalDependencies?: Record<string, string>;
};

async function findFiles(dir: string, matches: (name: string) => boolean) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && matches(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/** Walks up from a file to the directory holding the `package.json` that owns it. */
async function findPackageRoot(filePath: string) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    const manifest = await readFile(path.join(dir, 'package.json'), 'utf8').catch(() => null);
    if (manifest !== null) {
      return { dir, manifest: JSON.parse(manifest) as PackageJson };
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Shared libraries an addon's own package tree ships. Prebuilt-binary packages put them in
 * sibling optional dependencies picked by platform, which under any node_modules layout sit
 * next to the addon's package inside the same `node_modules` directory. Anything an addon
 * needs that isn't found this way comes from the OS and shouldn't be bundled.
 */
async function findVendoredLibraries(addonPath: string) {
  const owner = await findPackageRoot(addonPath);
  if (!owner) {
    return new Set<string>();
  }
  const siblings = Object.keys(owner.manifest.optionalDependencies ?? {}).map((name) =>
    path.resolve(owner.dir, '..', '..', name),
  );
  const libraries = await Promise.all(
    siblings.map((sibling) => findFiles(sibling, (name) => name.includes('.so'))),
  );
  return new Set(libraries.flat().map((library) => path.basename(library)));
}

async function findMissingLibraries(tracePath: string) {
  const { files } = JSON.parse(await readFile(tracePath, 'utf8')) as TraceFile;
  const traceDir = path.dirname(tracePath);
  const traced = new Set(files.map((file) => path.basename(file)));

  const missing: Array<string> = [];
  for (const file of files.filter((candidate) => candidate.endsWith('.node'))) {
    const addonPath = path.resolve(traceDir, file);
    const addon = await readFile(addonPath).catch(() => null);
    if (!addon) {
      continue;
    }
    const vendored = await findVendoredLibraries(addonPath);
    for (const soname of new Set(addon.toString('latin1').match(SONAME_PATTERN) ?? [])) {
      if (vendored.has(soname) && !traced.has(soname)) {
        missing.push(`${soname} (needed by ${path.basename(file)})`);
      }
    }
  }
  return missing;
}

async function verifyTracedNativeLibraries() {
  const tracePaths = await findFiles(APP_TRACE_DIR, (name) => name.endsWith('.nft.json'));
  const failures = new Map<string, Array<string>>();

  for (const tracePath of tracePaths) {
    const missing = await findMissingLibraries(tracePath);
    if (missing.length > 0) {
      failures.set(path.relative(process.cwd(), tracePath), missing);
    }
  }

  if (failures.size > 0) {
    for (const [route, missing] of failures) {
      log.error(`${route} is missing ${missing.join(', ')}`);
    }
    throw new Error(
      `${failures.size} route bundle(s) trace a native addon without the shared libraries it ` +
        'loads. Add the owning package to `outputFileTracingIncludes` in next.config.ts.',
    );
  }

  log.info(
    `Traced native addons resolve their shared libraries across ${tracePaths.length} routes`,
  );
}

verifyTracedNativeLibraries().catch((error: unknown) => {
  log.error(String(error));
  process.exitCode = 1;
});
