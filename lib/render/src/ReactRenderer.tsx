import React, {
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
	Component,
	type ErrorInfo,
	memo,
	useMemo,
	useCallback,
} from "react";
import ReactDOM from "react-dom/client";
import type { RendererProps, RenderContext, RenderInstance } from "./types";
import { renderSchema } from "./renderer";
import { createRenderContext } from "./context";
import { safeUnmount } from "./utils";

/**
 * Default component for not found components
 */
const DefaultNotFoundComponent: React.FC<{ componentName: string }> = memo(
	({ componentName }) => {
		return (
			<div
				style={{
					padding: "10px",
					border: "1px solid #ff4d4f",
					color: "#ff4d4f",
					borderRadius: "4px",
				}}
			>
				Component "{componentName}" not found
			</div>
		);
	},
);

DefaultNotFoundComponent.displayName = "DefaultNotFoundComponent";

/**
 * Error boundary component to catch renderer internal errors and prevent app crashes
 */
class ErrorBoundary extends Component<
	{
		fallback?: React.ReactNode;
		onError?: (error: Error, info: ErrorInfo) => void;
		children?: React.ReactNode;
	},
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		// Update state to show fallback UI on next render
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Can log error to error reporting service
		console.error("Renderer error boundary caught error:", error, errorInfo);
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	render() {
		if (this.state.hasError) {
			// Fallback UI
			return (
				this.props.fallback || (
					<div
						style={{
							padding: "12px",
							margin: "8px 0",
							border: "1px solid #ff4d4f",
							borderRadius: "4px",
							backgroundColor: "#fff2f0",
							color: "#ff4d4f",
						}}
					>
						<h4 style={{ margin: "0 0 8px 0" }}>Renderer Error</h4>
						<p style={{ margin: 0, fontSize: "12px" }}>
							{this.state.error?.message || "Unknown error"}
						</p>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

// Render error component
const RenderError = memo(({ error }: { error: Error | null }) => (
	<div
		style={{
			color: "red",
			padding: "10px",
			border: "1px solid red",
		}}
	>
		Render error: {error?.message || "Unknown error"}
	</div>
));

RenderError.displayName = "RenderError";

/**
 * Actual rendering component, optimized with memo
 */
const SchemaRenderer = memo(
	({
		schema,
		context,
		components,
		customCreateElement,
		thisRequiredInJSE,
		locale,
		messages,
		notFoundComponent,
	}: {
		schema: RendererProps["schema"];
		context: RenderContext;
		components: RendererProps["components"];
		customCreateElement?: RendererProps["customCreateElement"];
		thisRequiredInJSE?: boolean;
		locale?: string;
		messages?: Record<string, Record<string, string>>;
		notFoundComponent?: React.ComponentType<any>;
	}) => {
		// Cache render result using useMemo
		const rendered = useMemo(() => {
			if (!context) return null;

			try {
				return renderSchema(
					schema,
					context,
					components,
					customCreateElement,
					thisRequiredInJSE,
					locale,
					messages,
					notFoundComponent,
				);
			} catch (error) {
				console.error("Render error:", error);
				return (
					<div
						style={{ color: "red", padding: "10px", border: "1px solid red" }}
					>
						Render error: {(error as Error).message || String(error)}
					</div>
				);
			}
		}, [
			schema,
			context,
			components,
			customCreateElement,
			thisRequiredInJSE,
			locale,
			messages,
			notFoundComponent,
		]);

		return rendered;
	},
	(prevProps, nextProps) => {
		// Custom comparison function, only re-render when necessary
		// 1. schema changes
		// 2. context.state changes
		// 3. components changes

		// Quick reference check
		if (
			prevProps.schema === nextProps.schema &&
			prevProps.context === nextProps.context &&
			prevProps.components === nextProps.components
		) {
			return true; // No need to re-render
		}

		// Check if state has changed
		if (prevProps.context?.state !== nextProps.context?.state) {
			return false; // Need to re-render
		}

		// More detailed comparisons can be added here

		return false; // Default to re-render
	},
);

SchemaRenderer.displayName = "SchemaRenderer";

/**
 * React renderer component
 */
const ReactRenderer = forwardRef<any, RendererProps>(
	(
		{
			schema,
			components,
			componentsMap,
			appHelper = {},
			designMode,
			suspended = false,
			onCompGetRef,
			onCompGetCtx,
			rendererName = "ReactRenderer",
			customCreateElement,
			notFoundComponent = DefaultNotFoundComponent,
			thisRequiredInJSE = true,
			locale,
			messages,
		},
		ref,
	) => {
		// Use container to mount React component
		const [context, setContext] = useState<RenderContext | null>(null);
		const containerRef = useRef<HTMLDivElement>(null);
		const rendererRef = useRef<any>(null);
		const [renderError, setRenderError] = useState<Error | null>(null);

		// Track render count to prevent infinite loops
		const renderCountRef = useRef(0);

		// Last rendered schema reference
		const lastSchemaRef = useRef<any>(null);

		// Debounce timer
		const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

		// Global shared utility library, accessible via context.utils
		const sharedUtils = useMemo(
			() => ({
				alert: (...args: any[]) => window.alert(...args),
				confirm: (...args: any[]) => window.confirm(...args),
				console: console,
				fetch: (input: RequestInfo | URL, init?: RequestInit) =>
					fetch(input, init),
				// More global utility functions can be added here
			}),
			[],
		);

		// Update context function, optimized with useCallback
		const updateContext = useCallback(
			(newContext: Partial<RenderContext> = {}) => {
				setContext((prev) => {
					if (!prev) return null;

					// Create new context object
					const updatedContext = {
						...prev,
						...newContext,
					};

					// Ensure this points to context itself
					updatedContext.this = updatedContext;

					// Notify update
					if (onCompGetCtx && schema) {
						onCompGetCtx(schema, updatedContext);
					}

					return updatedContext;
				});
			},
			[schema, onCompGetCtx],
		);

		// Reset render counter function
		const resetRenderCount = useCallback(() => {
			renderCountRef.current = 0;
		}, []);

		// Debounced partial re-render function
		const rerenderOnly = useCallback(() => {
			// Cancel existing debounce timer if any
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			// Set new debounce timer
			debounceTimerRef.current = setTimeout(() => {
				// Trigger re-render by modifying an unrelated state value
				// This ensures context isn't reset
				setContext((prev) => {
					if (!prev) return null;

					// Copy current context to trigger React re-render
					return { ...prev };
				});

				// Clear any render error state
				setRenderError(null);

				// Clear timer reference
				debounceTimerRef.current = null;
			}, 16); // Use 16ms (approx. one frame) debounce delay
		}, []);

		// Expose instance methods
		useImperativeHandle(
			ref,
			() => ({
				getSchema: () => schema,
				getComponents: () => components,
				getContext: () => context,
				updateContext: updateContext,
				// Complete re-render (rebuild context)
				rerender: () => {
					// Reset render count
					resetRenderCount();

					setContext((prev) => {
						if (!prev)
							return createRenderContext(schema, {
								...appHelper,
								utils: {
									...(appHelper.utils || {}),
									...sharedUtils,
								},
								_rerender: rerenderOnly,
								autoRerender: true,
							});

						const newContext = createRenderContext(schema, {
							...appHelper,
							...prev,
							utils: {
								...prev.utils,
								...sharedUtils,
							},
							_rerender: rerenderOnly,
							autoRerender: true,
						});
						return newContext;
					});
					// Clear previous render errors
					setRenderError(null);
				},
				// Partial re-render (don't rebuild context)
				rerenderOnly,
			}),
			[
				schema,
				components,
				context,
				appHelper,
				sharedUtils,
				updateContext,
				rerenderOnly,
				resetRenderCount,
			],
		);

		// Initialize context - optimize with useEffect and memo
		useEffect(() => {
			try {
				// Skip recreating context if schema reference is same and context exists
				if (
					lastSchemaRef.current &&
					lastSchemaRef.current === schema &&
					context
				) {
					return;
				}

				// Update last schema reference
				lastSchemaRef.current = schema;

				// Reset render count
				resetRenderCount();

				const newContext = createRenderContext(schema, {
					...appHelper,
					// Add global utility functions
					utils: {
						...(appHelper.utils || {}),
						...sharedUtils,
					},
					// Add state change callback
					onStateChange: (state) => {
						if (onCompGetCtx) {
							onCompGetCtx(schema, { state });
						}
					},
					// Add internal render function reference
					_rerender: rerenderOnly,
					// Enable auto render
					autoRerender: true,
				});

				// Ensure this points to context itself
				newContext.this = newContext;

				setContext(newContext);
				// Reset error state
				setRenderError(null);
			} catch (error) {
				console.error("Error creating render context:", error);
				setRenderError(error as Error);
			}
		}, [
			schema,
			appHelper,
			onCompGetCtx,
			sharedUtils,
			rerenderOnly,
			resetRenderCount,
			context,
		]);

		// Handle ref callback
		useEffect(() => {
			if (onCompGetRef && containerRef.current) {
				onCompGetRef(schema, containerRef.current);
			}
		}, [schema, onCompGetRef]);

		// Handle design mode change re-render
		useEffect(() => {
			// Only trigger re-render on design mode change
			if (designMode) {
				// Reset render count
				resetRenderCount();

				setContext((prev) => (prev ? { ...prev } : null));
				// Reset error state
				setRenderError(null);
			}
		}, [designMode, resetRenderCount]);

		// Cleanup resources
		useEffect(() => {
			return () => {
				// Clear any pending debounce timers
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
					debounceTimerRef.current = null;
				}
			};
		}, []);

		// Handle errors
		const handleError = useCallback((error: Error, info: ErrorInfo) => {
			console.error("Renderer caught error:", error, info);
			setRenderError(error);
		}, []);

		// Optimize render content with useMemo
		const renderContent = useMemo(() => {
			// Increment render count
			renderCountRef.current += 1;

			// If too many renders, possible circular reference, stop rendering
			if (renderCountRef.current > 50) {
				return (
					<div
						style={{ color: "red", padding: "16px", border: "1px solid red" }}
					>
						<h3>Possible infinite render loop detected</h3>
						<p>
							Renderer has automatically stopped rendering. Please check your
							schema for circular references or recursive calls.
						</p>
					</div>
				);
			}

			if (!context || suspended) {
				return null;
			}

			if (renderError) {
				return <RenderError error={renderError} />;
			}

			try {
				// Wrap render content with error boundary
				return (
					<ErrorBoundary onError={handleError}>
						<SchemaRenderer
							schema={schema}
							context={context}
							components={components}
							customCreateElement={customCreateElement}
							thisRequiredInJSE={thisRequiredInJSE}
							locale={locale}
							messages={messages}
							notFoundComponent={notFoundComponent}
						/>
					</ErrorBoundary>
				);
			} catch (error) {
				console.error("Render error:", error);
				return <RenderError error={error as Error} />;
			}
		}, [
			context,
			suspended,
			renderError,
			schema,
			components,
			customCreateElement,
			thisRequiredInJSE,
			locale,
			messages,
			notFoundComponent,
			handleError,
		]);

		return (
			<div ref={containerRef} data-renderer={rendererName}>
				{renderContent}
			</div>
		);
	},
);

// Set component name
ReactRenderer.displayName = "ReactRenderer";

// Define return type extension for TypeScript to recognize static methods
interface ReactRendererType
	extends React.ForwardRefExoticComponent<
		RendererProps & React.RefAttributes<any>
	> {
	create: (
		schema: RendererProps["schema"],
		container: HTMLElement,
		options?: Partial<Omit<RendererProps, "schema">>,
	) => RenderInstance;
}

// Factory function - for directly creating render instances in DOM
(ReactRenderer as ReactRendererType).create = (
	schema: RendererProps["schema"],
	container: HTMLElement,
	options: Partial<Omit<RendererProps, "schema">> = {},
): RenderInstance => {
	const {
		components = {},
		appHelper = {},
		designMode,
		thisRequiredInJSE = true,
		locale,
		messages,
	} = options;

	// Render debounce control
	let renderTimeout: ReturnType<typeof setTimeout> | null = null;
	let root: any = null;
	let currentSchema = schema;
	let hasRenderError = false;
	const rendererRef: React.RefObject<any> = React.createRef();

	// Debounced update method to prevent performance issues from frequent updates
	const debouncedRender = (callback?: () => void) => {
		if (renderTimeout) {
			clearTimeout(renderTimeout);
		}
		renderTimeout = setTimeout(() => {
			render();
			renderTimeout = null;
			callback?.();
		}, 10);
	};

	// Partial render function that only refreshes state
	const refreshRender = () => {
		if (renderTimeout) {
			clearTimeout(renderTimeout);
		}
		renderTimeout = setTimeout(() => {
			// Re-render component with latest state, don't rebuild context
			if (!hasRenderError && rendererRef.current) {
				rendererRef.current.rerenderOnly();
			}
			renderTimeout = null;
		}, 10);
	};

	// Render function - create React component
	const render = () => {
		try {
			// Create or get React root node
			if (!root) {
				// New React 18 createRoot API
				if (ReactDOM.createRoot) {
					root = ReactDOM.createRoot(container);
				} else {
					// Compatibility for older React versions - need to import old API
					// @ts-ignore - ignore type error, compatibility for old React versions
					root = {
						render: (element: React.ReactNode) => {
							// @ts-ignore - ignore type error, compatibility for old React versions
							ReactDOM.render(element, container);
						},
						unmount: () => {
							// @ts-ignore - ignore type error, compatibility for old React versions
							ReactDOM.unmountComponentAtNode(container);
						},
					};
				}
			}

			// Render React component
			root.render(
				<ReactRenderer
					ref={rendererRef}
					schema={currentSchema}
					components={components}
					appHelper={appHelper}
					designMode={designMode}
					thisRequiredInJSE={thisRequiredInJSE}
					locale={locale}
					messages={messages}
				/>,
			);

			hasRenderError = false;
		} catch (error) {
			console.error("Render error:", error);
			hasRenderError = true;

			// Render error UI
			if (root) {
				root.render(
					<div
						style={{ color: "red", padding: "16px", border: "1px solid red" }}
					>
						<h3>Renderer Error</h3>
						<p>{(error as Error).message || String(error)}</p>
					</div>,
				);
			}
		}
	};

	// Render immediately
	render();

	// Return render instance interface
	return {
		root,
		container,
		unmount: () => {
			if (root) {
				try {
					root.unmount();
				} catch (error) {
					console.error("Error unmounting component:", error);
				}
			}
		},
		update: (newSchema) => {
			currentSchema = newSchema;
			debouncedRender();
			return {
				root,
				container,
				unmount: () => {
					if (root) safeUnmount(root);
				},
				update: (schema) => {
					currentSchema = schema;
					debouncedRender();
					return {} as RenderInstance;
				},
				getState: () => {
					return rendererRef.current?.getContext?.()?.state || {};
				},
				setState: (state) => {
					if (rendererRef.current?.getContext?.()) {
						const context = rendererRef.current.getContext();
						context.setState?.(state);
					}
					return {} as RenderInstance;
				},
				getContext: () => {
					return rendererRef.current?.getContext?.();
				},
				refreshRender,
			};
		},
		getState: () => {
			return rendererRef.current?.getContext?.()?.state || {};
		},
		setState: (state) => {
			if (rendererRef.current?.getContext?.()) {
				const context = rendererRef.current.getContext();
				context.setState?.(state);
			}
			return {
				root,
				container,
				unmount: () => {
					if (root) safeUnmount(root);
				},
				update: (schema) => {
					currentSchema = schema;
					debouncedRender();
					return {} as RenderInstance;
				},
				getState: () => {
					return rendererRef.current?.getContext?.()?.state || {};
				},
				setState: (state) => {
					if (rendererRef.current?.getContext?.()) {
						const context = rendererRef.current.getContext();
						context.setState?.(state);
					}
					return {} as RenderInstance;
				},
				getContext: () => {
					return rendererRef.current?.getContext?.();
				},
				refreshRender,
			};
		},
		getContext: () => {
			return rendererRef.current?.getContext?.();
		},
		refreshRender,
	};
};

export default ReactRenderer;
