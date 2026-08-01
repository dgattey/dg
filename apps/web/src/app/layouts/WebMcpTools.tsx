'use client';

import {
  favoriteAlbumsRoute,
  homeRoute,
  markdownPages,
  musicRoute,
} from '@dg/shared-core/routes/app';
import { useEffect } from 'react';

type JsonSchema = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: Array<string>;
  additionalProperties?: boolean;
};

type ModelContextTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
};

type ModelContextRegisterToolOptions = {
  signal?: AbortSignal;
};

type ModelContext = {
  registerTool: (
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions,
  ) => void | Promise<void>;
};

type NavigatorWithModelContext = Navigator & {
  modelContext?: ModelContext;
};

type DocumentWithModelContext = Document & {
  modelContext?: ModelContext;
};

const navigablePaths = [homeRoute, musicRoute, favoriteAlbumsRoute] as const;

type NavigablePath = (typeof navigablePaths)[number];

function isNavigablePath(value: unknown): value is NavigablePath {
  return typeof value === 'string' && (navigablePaths as ReadonlyArray<string>).includes(value);
}

async function summarizeLlmsTxt(): Promise<{ summary: string; preview: string }> {
  const response = await fetch('/llms.txt');
  if (!response.ok) {
    throw new Error(`Failed to fetch /llms.txt (${response.status})`);
  }
  const text = await response.text();
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  const title = lines.find((line) => line.startsWith('# '))?.slice(2) ?? 'Dylan Gattey';
  const blurb = lines.find((line) => line.startsWith('> '))?.slice(2) ?? '';
  const pageCount = lines.filter((line) => line.startsWith('- [')).length;
  return {
    preview: text.slice(0, 500),
    summary: `${title}: ${blurb} ${pageCount} linked resources in /llms.txt.`.trim(),
  };
}

/** Prefer navigator (isitagentready), fall back to document (WebMCP IDL). */
function getModelContext(): ModelContext | undefined {
  if (typeof navigator !== 'undefined') {
    const fromNavigator = (navigator as NavigatorWithModelContext).modelContext;
    if (fromNavigator?.registerTool) {
      return fromNavigator;
    }
  }
  if (typeof document !== 'undefined') {
    const fromDocument = (document as DocumentWithModelContext).modelContext;
    if (fromDocument?.registerTool) {
      return fromDocument;
    }
  }
  return undefined;
}

/**
 * Registers a few public site tools with WebMCP when the browser supports it.
 * Renders nothing. Passes AbortSignal so tools unregister on unmount.
 */
export function WebMcpTools() {
  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext?.registerTool) {
      return;
    }

    const abortController = new AbortController();
    const options = { signal: abortController.signal };

    const tools: Array<ModelContextTool> = [
      {
        description: 'List public Markdown-capable pages on this site (from the page registry).',
        execute: () =>
          markdownPages.map((page) => ({
            path: page.path,
            summary: page.summary,
            title: page.title,
          })),
        inputSchema: {
          additionalProperties: false,
          properties: {},
          type: 'object',
        },
        name: 'list_public_pages',
      },
      {
        description: 'Navigate the browser to the home, music, or favorite albums page.',
        execute: (args) => {
          const path = args.path;
          if (!isNavigablePath(path)) {
            throw new Error(
              `Invalid path. Use one of: ${navigablePaths.map((entry) => JSON.stringify(entry)).join(', ')}`,
            );
          }
          window.location.href = path;
          return { navigatedTo: path };
        },
        inputSchema: {
          additionalProperties: false,
          properties: {
            path: {
              description: 'Public page path to open',
              enum: [...navigablePaths],
              type: 'string',
            },
          },
          required: ['path'],
          type: 'object',
        },
        name: 'navigate_to_page',
      },
      {
        description: 'Fetch /llms.txt and return a short summary plus a text preview.',
        execute: () => summarizeLlmsTxt(),
        inputSchema: {
          additionalProperties: false,
          properties: {},
          type: 'object',
        },
        name: 'summarize_llms_txt',
      },
    ];

    for (const tool of tools) {
      void modelContext.registerTool(tool, options);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
}
