'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ServerInsertedHTMLContext, useServerInsertedHTML } from 'next/navigation';
import { type ReactNode, useContext, useState } from 'react';

type InsertedStyle = { isGlobal: boolean; name: string };

/**
 * Style names already streamed, per request. Keyed by Next's inserted-HTML
 * channel because Next's prerender runs a throwaway warmup client render and
 * then the final one into the same channel: each render gets its own registry,
 * and both would otherwise flush the whole shell's CSS into the head.
 */
const streamedNamesByChannel = new WeakMap<object, Set<string>>();

function streamedNamesFor(channel: object | null) {
  if (!channel) {
    return new Set<string>();
  }
  let names = streamedNamesByChannel.get(channel);
  if (!names) {
    names = new Set();
    streamedNamesByChannel.set(channel, names);
  }
  return names;
}

function createRegistry() {
  const cache = createCache({ key: 'mui' });
  cache.compat = true;
  const insert = cache.insert;
  let pending: Array<InsertedStyle> = [];
  cache.insert = (selector, serialized, sheet, shouldCache) => {
    if (cache.inserted[serialized.name] === undefined) {
      pending.push({ isGlobal: !selector, name: serialized.name });
    }
    return insert(selector, serialized, sheet, shouldCache);
  };
  const flush = () => {
    const flushed = pending;
    pending = [];
    return flushed;
  };
  return { cache, flush };
}

/**
 * Emotion cache for MUI that streams each style into the head once, in the
 * same `<style data-emotion>` tags as `@mui/material-nextjs`'s
 * `AppRouterCacheProvider`.
 */
export function EmotionStyleRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(createRegistry);
  const channel = useContext(ServerInsertedHTMLContext);

  useServerInsertedHTML(() => {
    const streamedNames = streamedNamesFor(channel);
    const globals: Array<{ name: string; style: string }> = [];
    const names: Array<string> = [];
    let styles = '';
    for (const { isGlobal, name } of flush()) {
      const style = cache.inserted[name];
      if (typeof style !== 'string' || streamedNames.has(name)) {
        continue;
      }
      streamedNames.add(name);
      if (isGlobal) {
        globals.push({ name, style });
      } else {
        names.push(name);
        styles += style;
      }
    }
    if (!globals.length && !styles) {
      return null;
    }
    return (
      <>
        {globals.map(({ name, style }) => (
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion-serialized CSS
            dangerouslySetInnerHTML={{ __html: style }}
            data-emotion={`${cache.key}-global ${name}`}
            key={name}
          />
        ))}
        {styles && (
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion-serialized CSS
            dangerouslySetInnerHTML={{ __html: styles }}
            data-emotion={[cache.key, ...names].join(' ')}
          />
        )}
      </>
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
