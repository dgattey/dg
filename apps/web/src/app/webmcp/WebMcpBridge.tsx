'use client';

import { useEffect } from 'react';
import { registerWebMcpTools } from './registerWebMcpTools';

/**
 * Registers browser WebMCP tools as soon as the client hydrates.
 * Renders nothing. Agents discover tools via navigator/document.modelContext.
 */
export function WebMcpBridge() {
  useEffect(() => {
    const controller = new AbortController();
    registerWebMcpTools({ signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
