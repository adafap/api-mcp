import ReactRenderer from './ReactRenderer';
import { createRenderContext } from './context';

export { ReactRenderer, createRenderContext };
export type {
  Schema,
  RenderContext,
  ComponentsMap,
  RenderInstance,
  JSExpression,
  JSFunction,
} from './types';

export default ReactRenderer;
