import React from "react";

/**
 * JS Expression Type
 */
export type JSExpression = {
	type: "JSExpression";
	value: string;
};

/**
 * JS Function Type
 */
export type JSFunction = {
	type: "JSFunction";
	value: string;
};

/**
 * Schema Type
 */
export type Schema = {
	type: string;
	properties?: Record<string, Schema>;
	items?: Schema;
	required?: string[];
	enum?: any[];
	description?: string;
	default?: any;
	format?: string;
	pattern?: string;
	minimum?: number;
	maximum?: number;
};

/**
 * Render Context
 */
export type RenderContext = {
	state: Record<string, any>;
	setState: (newState: Record<string, any>) => void;
	props: Record<string, any>;
	schema: Schema;
	components: ComponentMap;
	utils: Record<string, any>;
	// Whether to auto re-render (on state change)
	autoRerender?: boolean;
	// Internal re-render callback function (injected by renderer)
	rerender?: () => void;
};

/**
 * Component Map Type
 */
export type ComponentMap = Record<string, React.ComponentType<any>>;

/**
 * Render Instance
 */
export type RenderInstance = {
	context: RenderContext;
	render: (
		// Partial refresh rendering, without rebuilding context
		partialRefresh?: boolean,
	) => React.ReactNode;
};

/**
 * Renderer Props
 */
export type RendererProps = {
	schema: Schema;
	components?: ComponentMap;
	state?: Record<string, any>;
	props?: Record<string, any>;
	utils?: Record<string, any>;
	autoRerender?: boolean;
	onChange?: (state: Record<string, any>) => void;
};

// Add global declarations
declare global {
	interface Window {
		__RENDER_CONTEXT__: RenderContext;
	}
}
