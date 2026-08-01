/**
 * @jest-environment node
 */

import { registerPublicWebMcpTools, resolveModelContext } from '../registerPublicWebMcpTools';
import type { ModelContext, WebMcpToolDefinition } from '../webMcpTypes';

function createTool(name: string): WebMcpToolDefinition {
  return {
    description: `${name} description`,
    execute: () => ({ ok: true }),
    inputSchema: { additionalProperties: false, properties: {}, type: 'object' },
    name,
  };
}

describe('registerPublicWebMcpTools', () => {
  it('prefers navigator.modelContext and falls back to document.modelContext', () => {
    const navigatorContext: ModelContext = { registerTool: () => undefined };
    const documentContext: ModelContext = { registerTool: () => undefined };

    expect(
      resolveModelContext({ modelContext: navigatorContext }, { modelContext: documentContext }),
    ).toBe(navigatorContext);
    expect(resolveModelContext({}, { modelContext: documentContext })).toBe(documentContext);
    expect(resolveModelContext({}, {})).toBeNull();
    expect(resolveModelContext(undefined, undefined)).toBeNull();
  });

  it('is a no-op when the browser API is unavailable', () => {
    expect(() =>
      registerPublicWebMcpTools({
        modelContext: null,
        tools: [createTool('list_public_markdown_pages')],
      }),
    ).not.toThrow();
  });

  it('registers every tool with one shared AbortSignal and aborts on cleanup', () => {
    const registeredSignals: Array<AbortSignal> = [];
    const modelContext: ModelContext = {
      registerTool: (_tool, options) => {
        if (options?.signal) {
          registeredSignals.push(options.signal);
        }
        return Promise.resolve();
      },
    };
    const tools = [
      createTool('list_public_markdown_pages'),
      createTool('navigate_to_public_page'),
      createTool('read_llms_txt'),
    ];

    const unregister = registerPublicWebMcpTools({
      modelContext,
      tools,
    });

    expect(registeredSignals).toHaveLength(3);
    expect(registeredSignals[0]).toBeInstanceOf(AbortSignal);
    expect(new Set(registeredSignals).size).toBe(1);
    expect(registeredSignals[0]?.aborted).toBe(false);

    unregister();
    expect(registeredSignals[0]?.aborted).toBe(true);
  });

  it('swallows rejected registration promises', async () => {
    const modelContext: ModelContext = {
      registerTool: () => Promise.reject(new Error('register failed')),
    };

    registerPublicWebMcpTools({
      modelContext,
      tools: [createTool('list_public_markdown_pages')],
    });

    await Promise.resolve();
    await Promise.resolve();
  });
});
