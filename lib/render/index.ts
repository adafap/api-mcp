/**
 * Render engine entry file
 * Exports all renderer-related components, types and utility functions
 *
 * High-performance render engine v2.0
 * Supports schema caching, expression optimization and efficient state management
 */

import { createRenderContext } from './src/context';  
import { RenderContext } from './src/types';
import  { RenderComponent } from './src/components';
import { RenderUtils } from './src/utils';

// Global context for render engine
let globalRenderContext: RenderContext | null = null;

// Add global mount point to support client components accessing render context directly
export function setGlobalRenderContext(context: RenderContext | null) {
  globalRenderContext = context;
}

// Enhance createRenderContext method to automatically sync context to global
export function createEnhancedRenderContext(options?: any): RenderContext {
  const context = createRenderContext(options);

  // Sync to global context
  setGlobalRenderContext(context);

  return context;
}

// Export main components and functions
export { RenderContext, RenderComponent, RenderUtils, createRenderContext };
