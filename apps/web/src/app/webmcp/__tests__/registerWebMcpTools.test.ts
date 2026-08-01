import { registerWebMcpTools } from '../registerWebMcpTools';
import type { WebMcpTool } from '../webMcpTypes';

describe('registerWebMcpTools', () => {
  it('returns false when modelContext is missing', () => {
    expect(registerWebMcpTools({ globalObject: {} as typeof globalThis })).toBe(false);
  });

  it('registers read-only tools via provideContext when available', async () => {
    let registered: ReadonlyArray<WebMcpTool> | undefined;
    const globalObject = {
      document: {
        modelContext: {
          provideContext: ({ tools }: { tools: ReadonlyArray<WebMcpTool> }) => {
            registered = tools;
          },
        },
      },
      location: { assign: jest.fn() },
    } as unknown as typeof globalThis;

    expect(registerWebMcpTools({ globalObject })).toBe(true);
    expect(registered?.map((tool) => tool.name)).toEqual([
      'list_pages',
      'fetch_markdown',
      'open_page',
    ]);
    expect(registered?.every((tool) => tool.annotations?.readOnlyHint === true)).toBe(true);

    const listPages = registered?.find((tool) => tool.name === 'list_pages');
    const listed = await listPages?.execute({});
    expect(listed).toContain('/music/albums');
    expect(listed).toContain('/llms.txt');
  });

  it('falls back to registerTool with an abort signal', () => {
    const registerTool = jest.fn();
    const controller = new AbortController();
    const globalObject = {
      location: { assign: jest.fn() },
      navigator: {
        modelContext: { registerTool },
      },
    } as unknown as typeof globalThis;

    expect(registerWebMcpTools({ globalObject, signal: controller.signal })).toBe(true);
    expect(registerTool).toHaveBeenCalledTimes(3);
    expect(registerTool.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });
});
