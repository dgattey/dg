import {
  favoriteAlbumsRoute,
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  llmsTxtRoute,
  type MarkdownPagePath,
  markdownPages,
  musicRoute,
  tryHtmlPathToMarkdownPath,
} from '@dg/shared-core/routes/app';
import { getModelContext, type WebMcpTool } from './webMcpTypes';

const pagePathEnum = markdownPages.map((page) => page.path);

async function fetchText(pathname: string): Promise<string> {
  const response = await fetch(pathname, {
    headers: { Accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${pathname}`);
  }
  return response.text();
}

function buildTools(navigate: (path: string) => void): ReadonlyArray<WebMcpTool> {
  return [
    {
      annotations: { readOnlyHint: true },
      description:
        'List public pages on this site with HTML and Markdown URLs. Use before fetching content.',
      execute: () =>
        JSON.stringify(
          {
            indexes: {
              llmsFullTxt: llmsFullTxtRoute,
              llmsTxt: llmsTxtRoute,
            },
            pages: markdownPages.map((page) => ({
              markdownPath: htmlPathToMarkdownPath(page.path),
              path: page.path,
              summary: page.summary,
              title: page.title,
            })),
          },
          null,
          2,
        ),
      inputSchema: {
        additionalProperties: false,
        properties: {},
        type: 'object',
      },
      name: 'list_pages',
    },
    {
      annotations: { readOnlyHint: true },
      description:
        'Fetch the Markdown twin for a public page path (/, /music, /music/albums) or an index path (/llms.txt, /llms-full.txt).',
      execute: (args) => {
        const path = String(args.path ?? '');
        if (path === llmsTxtRoute || path === llmsFullTxtRoute) {
          return fetchText(path);
        }
        if (path.endsWith('.md')) {
          return fetchText(path);
        }
        const markdownPath = tryHtmlPathToMarkdownPath(path);
        if (!markdownPath) {
          return `ERROR: unsupported path "${path}". Use one of: ${pagePathEnum.join(', ')}, ${llmsTxtRoute}, ${llmsFullTxtRoute}`;
        }
        return fetchText(markdownPath);
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          path: {
            description: 'Public HTML path, .md twin, llms.txt, or llms-full.txt',
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
      name: 'fetch_markdown',
    },
    {
      annotations: { readOnlyHint: true },
      description:
        'Navigate this browser tab to a public site page. Prefer fetch_markdown when you only need content.',
      execute: (args) => {
        const path = String(args.path ?? '') as MarkdownPagePath | string;
        if (!pagePathEnum.includes(path as MarkdownPagePath)) {
          return `ERROR: unsupported path "${path}". Use one of: ${pagePathEnum.join(', ')}`;
        }
        navigate(path);
        return `Navigating to ${path}`;
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          path: {
            description: 'Public HTML path to open',
            enum: ['/', musicRoute, favoriteAlbumsRoute],
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
      name: 'open_page',
    },
  ];
}

/** Registers read-only WebMCP tools when the browser exposes modelContext. */
export function registerWebMcpTools(options?: {
  signal?: AbortSignal;
  navigate?: (path: string) => void;
  globalObject?: typeof globalThis;
}): boolean {
  const globalObject = options?.globalObject ?? globalThis;
  const modelContext = getModelContext(globalObject);
  if (!modelContext) {
    return false;
  }

  const navigate =
    options?.navigate ??
    ((path: string) => {
      globalObject.location.assign(path);
    });

  const tools = buildTools(navigate);

  if (typeof modelContext.provideContext === 'function') {
    modelContext.provideContext({ tools });
    return true;
  }

  if (typeof modelContext.registerTool === 'function') {
    for (const tool of tools) {
      modelContext.registerTool(tool, { signal: options?.signal });
    }
    return true;
  }

  return false;
}
