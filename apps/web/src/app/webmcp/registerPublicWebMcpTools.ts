import type { ModelContext, WebMcpToolDefinition } from './webMcpTypes';

type ModelContextHost = {
  readonly modelContext?: ModelContext;
};

/** Prefer navigator.modelContext for scanners; fall back to document.modelContext. */
export function resolveModelContext(
  navigatorHost: ModelContextHost | null | undefined,
  documentHost: ModelContextHost | null | undefined,
): ModelContext | null {
  const fromNavigator = navigatorHost?.modelContext;
  if (fromNavigator && typeof fromNavigator.registerTool === 'function') {
    return fromNavigator;
  }

  const fromDocument = documentHost?.modelContext;
  if (fromDocument && typeof fromDocument.registerTool === 'function') {
    return fromDocument;
  }

  return null;
}

export function getBrowserModelContext(): ModelContext | null {
  const navigatorHost = typeof navigator === 'undefined' ? undefined : navigator;
  const documentHost = typeof document === 'undefined' ? undefined : document;
  return resolveModelContext(navigatorHost, documentHost);
}

/**
 * Registers tools against a shared AbortSignal. Missing API is a no-op.
 * Rejected registration promises are swallowed so cleanup cannot surface unhandled rejections.
 */
export function registerPublicWebMcpTools(args: {
  modelContext: ModelContext | null;
  tools: ReadonlyArray<WebMcpToolDefinition>;
}): () => void {
  const { modelContext, tools } = args;
  if (!modelContext) {
    return () => undefined;
  }

  const controller = new AbortController();
  for (const tool of tools) {
    void Promise.resolve(
      modelContext.registerTool(tool, { signal: controller.signal }),
    ).catch(() => undefined);
  }

  return () => {
    controller.abort();
  };
}
