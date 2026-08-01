export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

export type WebMcpModelContext = {
  provideContext?: (options: { tools: ReadonlyArray<WebMcpTool> }) => void;
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
};

type ModelContextHost = {
  document?: { modelContext?: WebMcpModelContext };
  navigator?: { modelContext?: WebMcpModelContext };
};

export function getModelContext(
  globalObject: typeof globalThis = globalThis,
): WebMcpModelContext | null {
  const host = globalObject as typeof globalThis & ModelContextHost;
  return host.document?.modelContext ?? host.navigator?.modelContext ?? null;
}
