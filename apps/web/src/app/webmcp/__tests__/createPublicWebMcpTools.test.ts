/**
 * @jest-environment node
 */

import {
  htmlPathToMarkdownPath,
  llmsTxtRoute,
  markdownPagePaths,
  markdownPages,
} from '@dg/shared-core/routes/app';
import { createPublicWebMcpTools } from '../createPublicWebMcpTools';

describe('createPublicWebMcpTools', () => {
  it('exposes three tools with metadata shapes derived from the shared registry', () => {
    const tools = createPublicWebMcpTools({
      fetch: jest.fn(),
      navigate: jest.fn(),
    });

    expect(tools.map((tool) => tool.name)).toEqual([
      'list_public_markdown_pages',
      'navigate_to_public_page',
      'read_llms_txt',
    ]);

    for (const tool of tools) {
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.execute).toBe('function');
    }

    const navigate = tools.find((tool) => tool.name === 'navigate_to_public_page');
    expect(navigate?.inputSchema.required).toEqual(['path']);
    expect(navigate?.inputSchema.properties?.path).toEqual({
      description: 'Public HTML path to open',
      enum: [...markdownPagePaths],
      type: 'string',
    });
  });

  it('lists pages from the shared markdown registry', async () => {
    const tools = createPublicWebMcpTools({
      fetch: jest.fn(),
      navigate: jest.fn(),
    });
    const listTool = tools.find((tool) => tool.name === 'list_public_markdown_pages');
    if (!listTool) {
      throw new Error('missing list_public_markdown_pages tool');
    }

    const result = await listTool.execute({});
    expect(result).toEqual({
      pages: markdownPages.map((page) => ({
        markdownPath: htmlPathToMarkdownPath(page.path),
        path: page.path,
        summary: page.summary,
        title: page.title,
      })),
    });
  });

  it('rejects invalid navigation input and navigates for valid paths', async () => {
    const navigate = jest.fn();
    const tools = createPublicWebMcpTools({
      fetch: jest.fn(),
      navigate,
    });
    const navigateTool = tools.find((tool) => tool.name === 'navigate_to_public_page');
    if (!navigateTool) {
      throw new Error('missing navigate tool');
    }

    await expect(navigateTool.execute({})).rejects.toThrow(
      'navigate_to_public_page requires a path',
    );
    await expect(navigateTool.execute({ path: '/dev-console' })).rejects.toThrow(
      'navigate_to_public_page path must be a public markdown page',
    );
    expect(navigate).not.toHaveBeenCalled();

    await expect(navigateTool.execute({ path: '/music' })).resolves.toEqual({ path: '/music' });
    expect(navigate).toHaveBeenCalledWith('/music');
  });

  it('fetches live llms.txt and rejects non-OK responses', async () => {
    const fetchMock = jest.fn(
      async () => new Response('# Dylan Gattey\n', { status: 200, statusText: 'OK' }),
    );
    const tools = createPublicWebMcpTools({
      fetch: fetchMock,
      navigate: jest.fn(),
    });
    const readTool = tools.find((tool) => tool.name === 'read_llms_txt');
    if (!readTool) {
      throw new Error('missing read_llms_txt tool');
    }

    await expect(readTool.execute({})).resolves.toEqual({ text: '# Dylan Gattey\n' });
    expect(fetchMock).toHaveBeenCalledWith(llmsTxtRoute);

    fetchMock.mockResolvedValueOnce(
      new Response('nope', { status: 503, statusText: 'Service Unavailable' }),
    );
    await expect(readTool.execute({})).rejects.toThrow(`Failed to fetch ${llmsTxtRoute}: 503`);
  });
});
