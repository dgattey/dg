export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

export type WebMcpModelContext = {
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
};

type ModelContextHost = {
  navigator?: { modelContext?: WebMcpModelContext };
};

export function getModelContext(
  globalObject: typeof globalThis = globalThis,
): WebMcpModelContext | null {
  const host = globalObject as typeof globalThis & ModelContextHost;
  return host.navigator?.modelContext ?? null;
}
