import { favoriteAlbumsRoute, homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { render } from '@testing-library/react';
import { WebMcpTools } from '../WebMcpTools';

type RegisteredTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
};

describe('WebMcpTools', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    jest.restoreAllMocks();
  });

  it('registers tools when navigator.modelContext is available', async () => {
    const registered: Array<{ tool: RegisteredTool; options?: { signal?: AbortSignal } }> = [];
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (tool: RegisteredTool, options?: { signal?: AbortSignal }) => {
            registered.push({ options, tool });
          },
        },
      },
    });

    const { unmount } = render(<WebMcpTools />);

    expect(registered.map((entry) => entry.tool.name)).toEqual([
      'list_public_pages',
      'navigate_to_page',
      'summarize_llms_txt',
    ]);
    expect(registered.every((entry) => entry.options?.signal instanceof AbortSignal)).toBe(true);

    const listPages = registered.find((entry) => entry.tool.name === 'list_public_pages');
    const navigate = registered.find((entry) => entry.tool.name === 'navigate_to_page');
    expect(listPages).toBeDefined();
    expect(navigate).toBeDefined();

    const pages = await listPages?.tool.execute({});
    expect(pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: homeRoute }),
        expect.objectContaining({ path: musicRoute }),
        expect.objectContaining({ path: favoriteAlbumsRoute }),
      ]),
    );

    expect(() => navigate?.tool.execute({ path: '/dev-console' })).toThrow(/Invalid path/);

    const signal = listPages?.options?.signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('no-ops when WebMCP is unavailable', () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {},
    });

    expect(() => {
      const { unmount } = render(<WebMcpTools />);
      unmount();
    }).not.toThrow();
  });
});
