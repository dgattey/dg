import {
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  llmsTxtRoute,
  type MarkdownPagePath,
  markdownPagePaths,
  markdownPages,
} from '@dg/shared-core/routes/app';
import type { WebMcpToolDefinition } from './webMcpTypes';

export type PublicWebMcpToolDeps = {
  navigate: (path: MarkdownPagePath) => void | Promise<void>;
  fetch: (input: string) => Promise<Response>;
};

const emptyObjectSchema = {
  additionalProperties: false,
  properties: {},
  type: 'object',
} as const;

function parseNavigatePath(input: unknown): MarkdownPagePath {
  if (typeof input !== 'object' || input === null || !('path' in input)) {
    throw new Error('navigate_to_public_page requires a path');
  }

  const pathValue = Reflect.get(input, 'path');
  if (typeof pathValue !== 'string' || !isMarkdownPagePath(pathValue)) {
    throw new Error('navigate_to_public_page path must be a public markdown page');
  }

  return pathValue;
}

/** Typed WebMCP tools derived from the shared public Markdown registry. */
export function createPublicWebMcpTools(deps: PublicWebMcpToolDeps): Array<WebMcpToolDefinition> {
  return [
    {
      description: 'List public pages that expose Markdown twins for agent-friendly reading.',
      execute: () => ({
        pages: markdownPages.map((page) => ({
          markdownPath: htmlPathToMarkdownPath(page.path),
          path: page.path,
          summary: page.summary,
          title: page.title,
        })),
      }),
      inputSchema: emptyObjectSchema,
      name: 'list_public_markdown_pages',
    },
    {
      description: 'Navigate the browser to a public HTML page from the Markdown page registry.',
      execute: async (input: unknown) => {
        const path = parseNavigatePath(input);
        await deps.navigate(path);
        return { path };
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          path: {
            description: 'Public HTML path to open',
            enum: [...markdownPagePaths],
            type: 'string',
          },
        },
        required: ['path'],
        type: 'object',
      },
      name: 'navigate_to_public_page',
    },
    {
      description: 'Fetch the live public /llms.txt Markdown index for this site.',
      execute: async () => {
        const response = await deps.fetch(llmsTxtRoute);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${llmsTxtRoute}: ${response.status}`);
        }
        return { text: await response.text() };
      },
      inputSchema: emptyObjectSchema,
      name: 'read_llms_txt',
    },
  ];
}
