'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createPublicWebMcpTools } from './createPublicWebMcpTools';
import { getBrowserModelContext, registerPublicWebMcpTools } from './registerPublicWebMcpTools';

/**
 * Site-wide WebMCP client leaf. Registers public discovery tools when the
 * browser exposes modelContext; otherwise renders nothing.
 */
export function SiteWebMcp() {
  const router = useRouter();

  useEffect(() => {
    return registerPublicWebMcpTools({
      modelContext: getBrowserModelContext(),
      tools: createPublicWebMcpTools({
        fetch: (input) => fetch(input),
        navigate: (path) => {
          router.push(path);
        },
      }),
    });
  }, [router]);

  return null;
}
