/**
 * Minimal ambient draft types for the WebMCP imperative API.
 * Input to `execute` is always `unknown` and must be validated at the boundary.
 */

export type WebMcpJsonSchema = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: ReadonlyArray<string>;
  additionalProperties?: boolean;
};

export type WebMcpToolDefinition = {
  name: string;
  description: string;
  inputSchema: WebMcpJsonSchema;
  execute: (input: unknown) => unknown | Promise<unknown>;
};

export type ModelContext = {
  registerTool: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

declare global {
  interface Navigator {
    readonly modelContext?: ModelContext;
  }

  interface Document {
    readonly modelContext?: ModelContext;
  }
}
