/**
 * MCP UI Automatic Rendering System
 * This system is used to automatically generate Mermaid charts or Markdown tables based on API response data
 */

// Export core renderer
export { UIRenderer } from "./ui-renderer";
export type { RenderType, MermaidRenderResult } from "./ui-renderer";

// Export AI service
export { AIProvider } from "./ai-provider";

// Export form generator
export { FormGenerator } from "./form-generator";

// Export error analyzer
export { ErrorAnalyzer } from "./error-analyzer";

// Export server request
export { serverRequest } from "./server-request";

// Export type definitions
export * from "../types";
