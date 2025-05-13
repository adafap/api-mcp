import type {
	ApiRequest,
	APIInfo,
	IApiExecutor,
	ErrorAnalysisResult,
	FormRenderResult,
	ApiResponse,
	RenderContext,
	UIComponent,
	RenderOptions,
} from "../types";

import axios from "axios";
import { myProvider } from "@/lib/ai/providers";
import { AIProvider } from "./ai-provider";
import { FormGenerator } from "./form-generator";
import { ErrorAnalyzer } from "./error-analyzer";
import { z } from "zod";
import { serverRequest } from "./server-request";
import type { ReactNode } from "react";
import type { Method } from "axios";

/**
 * Mermaid render result
 */
export interface MermaidRenderResult {
	success: boolean;
	mermaidCode?: string;
	markdownTable?: string;
	error?: string;
	rawData?: Record<string, unknown>;
	preferredDisplay?: "chart" | "table";
}

/**
 * Render type
 */
export type RenderType = "chart" | "form" | "table" | "auto";

interface ExtendedApiRequest extends ApiRequest {
	method: Method;
	path: string;
}

/**
 * UI Renderer
 * Used to render UI components and handle user interactions
 */
export class UIRenderer {
	private apiExecutor: IApiExecutor; // API executor
	private formGenerator: FormGenerator; // Form generator
	private errorAnalyzer: ErrorAnalyzer; // Error analyzer
	private context: RenderContext;

	/**
	 * Static method: Directly process API request and generate Mermaid/Markdown
	 * Provides a simple one-stop calling interface
	 *
	 * @param request API request
	 * @returns Generated Mermaid code or error message
	 */
	static async handleRequest(
		request: ApiRequest,
	): Promise<ApiResponse<unknown>> {
		const reqId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		try {
			console.log(`[MCP:UIRenderer:${reqId}] Starting request processing`);

			// Validate required fields
			const {
				userQuery,
				serviceId,
				apiId,
				method,
				path,
				renderType = "auto",
				baseUrl = "http://localhost:3030",
			} = request;

			// Use API base URL from environment variables, ignore baseUrl in request
			const forcedBaseUrl = process.env.API_BASE_URL || "http://localhost:3030";
			request.baseUrl = forcedBaseUrl;
			console.log(
				`[MCP:UIRenderer:${reqId}] Base URL (environment): ${forcedBaseUrl}`,
			);

			if (!userQuery) {
				console.warn(
					`[MCP:UIRenderer:${reqId}] Missing user query (userQuery), cannot generate render content`,
				);
				return {
					success: false,
					error:
						"Missing user query (userQuery), cannot generate render content",
				} as MermaidRenderResult;
			}

			// Create API information object
			const apiInfo: APIInfo = {
				id: `${serviceId}/${apiId}`,
				name: `${serviceId}/${apiId}`,
				method: method as Method,
				path: path as string,
				parameters: {},
				description: "",
			};

			console.log(
				`[MCP:UIRenderer:${reqId}] Created API information object:`,
				JSON.stringify(apiInfo),
			);

			// Create AI provider instance
			console.log(`[MCP:UIRenderer:${reqId}] Creating AI provider instance`);
			const aiProvider = new AIProvider(myProvider, "chat-model");

			console.log(`[MCP:UIRenderer:${reqId}] Creating API executor`);
			const apiExecutor = UIRenderer.createDefaultApiExecutor();

			// Create renderer instance
			console.log(`[MCP:UIRenderer:${reqId}] Creating UIRenderer instance`);
			const renderer = new UIRenderer(apiExecutor);

			// Determine render type
			let actualRenderType = renderType;
			if (actualRenderType === "auto") {
				// Automatically determine render type
				actualRenderType = renderer.determineRenderType(userQuery, apiInfo);
				console.log(
					`[MCP:UIRenderer:${reqId}] Automatically determined render type: ${actualRenderType}`,
				);
			}

			// Process request based on render type
			if (actualRenderType === "form") {
				// Form rendering
				return await renderer.handleFormRequest(userQuery, apiInfo);
			}

			const parameters = await renderer.generateApiParameters(
				userQuery,
				apiInfo,
			);

			try {
				console.log(`[MCP:UIRenderer:${reqId}] Starting API call`);
				const apiResponse = await renderer.callApi(
					apiInfo,
					parameters,
					request.baseUrl,
				);

				// Check API call result
				if (!apiResponse.success) {
					// Analyze error
					console.log(
						`[MCP:UIRenderer:${reqId}] API call failed, analyzing error`,
					);
					return await renderer.analyzeApiError(
						apiResponse.error instanceof Error
							? apiResponse.error
							: new Error(String(apiResponse.message || "Unknown error")),
						apiInfo,
						parameters,
					);
				}

				console.log(
					`[MCP:UIRenderer:${reqId}] Generating Mermaid and Markdown render result`,
				);
				const renderResult = await renderer.generateMermaidRender(
					userQuery,
					apiResponse.data as Record<string, unknown>,
					apiInfo,
				);

				console.log(
					`[MCP:UIRenderer:${reqId}] Processing completed, generated Mermaid length: ${renderResult.mermaidCode?.length || 0}`,
				);

				return {
					success: true,
					data: renderResult,
				};
			} catch (error) {
				console.log(
					`[MCP:UIRenderer:${reqId}] API call exception, analyzing error`,
				);
				return await renderer.analyzeApiError(error, apiInfo, parameters);
			}
		} catch (error) {
			console.error(
				`[MCP:UIRenderer:${reqId}] Request processing failed:`,
				error,
			);
			return {
				success: false,
				error: "Request failed",
				message: error instanceof Error ? error.message : "Unknown error",
			} as MermaidRenderResult;
		}
	}

	/**
	 * Constructor
	 * @param apiExecutor API executor
	 */
	constructor(apiExecutor: IApiExecutor) {
		this.apiExecutor = apiExecutor;
		this.formGenerator = new FormGenerator();
		this.errorAnalyzer = new ErrorAnalyzer();
		this.context = {
			state: {},
			props: {},
			getComponent: () => undefined,
			renderComponent: () => undefined,
			getData: () => ({}),
			setTheme: () => {},
			setLocale: () => {},
			createChildContext: () => ({
				state: {},
				props: {},
				getComponent: () => undefined,
				renderComponent: () => undefined,
				getData: () => ({}),
				setTheme: () => {},
				setLocale: () => {},
				createChildContext: () => this.context.createChildContext(),
			}),
		};
	}

	/**
	 * Determine render type
	 * @param userQuery User query
	 * @param apiInfo API information
	 * @returns Render type
	 */
	determineRenderType(userQuery: string, apiInfo: APIInfo): RenderType {
		// Check method type
		const method = apiInfo.method.toLowerCase();
		if (method === "post" || method === "put" || method === "patch") {
			// Write operations usually need forms
			return "form";
		}

		// Check query content
		const formKeywords = [
			"form",
			"submit",
			"create",
			"update",
			"edit",
			"fill",
			"modify",
			"input",
			"write",
			"change",
			"new",
		];
		for (const keyword of formKeywords) {
			if (userQuery.toLowerCase().includes(keyword)) {
				return "form";
			}
		}

		// Default to chart rendering
		return "chart";
	}

	/**
	 * Handle form request
	 * @param userQuery User query
	 * @param apiInfo API information
	 * @returns Form render result
	 */
	async handleFormRequest(
		userQuery: string,
		apiInfo: APIInfo,
	): Promise<FormRenderResult> {
		try {
			// Generate form schema
			const formSchema = await this.formGenerator.generateFormSchema(
				apiInfo,
				userQuery,
			);

			return {
				success: true,
				formSchema,
			};
		} catch (error) {
			console.error("Form generation failed:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to generate form",
			};
		}
	}

	/**
	 * Analyze API error
	 * @param error Error object
	 * @param apiInfo API information
	 * @param params Request parameters
	 * @returns Error analysis result
	 */
	async analyzeApiError(
		error: Error | unknown,
		apiInfo: APIInfo,
		params: Record<string, unknown>,
	): Promise<ErrorAnalysisResult> {
		try {
			// Use error analyzer to analyze error
			return await this.errorAnalyzer.analyzeError(error, apiInfo, params);
		} catch (analysisError) {
			console.error("Error analysis failed:", analysisError);

			// Return basic error information
			return {
				success: false,
				errorType: "unknown",
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				suggestion: "Please contact administrator or try again later",
				possibleSolutions: [
					"Retry request",
					"Check network connection",
					"Contact system administrator",
				],
				isFatal: true,
				renderAs: "message",
				retryStrategy: {
					shouldRetry: false,
				},
			};
		}
	}

	/**
	 * Generate API parameters
	 * @param naturalLanguage Natural language query
	 * @param apiInfo API information
	 * @returns Generated parameters
	 */
	async generateApiParameters(
		naturalLanguage: string,
		apiInfo: APIInfo,
	): Promise<Record<string, unknown>> {
		const paramGenId = `param_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		console.log(
			`[Parameter Generation:${paramGenId}] ==== Starting parameter generation ====`,
		);
		console.log(
			`[Parameter Generation:${paramGenId}] API path: ${apiInfo.path}`,
		);
		console.log(
			`[Parameter Generation:${paramGenId}] User query: ${naturalLanguage}`,
		);

		// Create AI provider
		const aiProvider = new AIProvider(myProvider, "chat-model");

		// Define parameter generation schema
		const paramsSchema = z.object({
			params: z.record(z.any()).default({}).describe("API call parameters"),
			explanation: z
				.string()
				.describe("Explanation of parameter generation process"),
		});

		// Special path handling
		let specialInstructions = "";

		// Special handling for list queries
		if (
			apiInfo.path.includes("/{id}") &&
			(naturalLanguage.toLowerCase().includes("all") ||
				naturalLanguage.toLowerCase().includes("list") ||
				naturalLanguage.toLowerCase().includes("every"))
		) {
			specialInstructions = `
Special note: User is querying for a list of all resources, so you should set the id parameter to "all", which will be interpreted by the system as a list request.
Example: { "id": "all" }`;
			console.log(
				`[Parameter Generation:${paramGenId}] Adding special note: List query detected`,
			);
		}

		// Build system prompt
		const systemPrompt = `You are a professional API parameter extraction tool. Given a user's natural language query and API information, you need to extract the parameters needed to call the API.

Please extract the necessary parameters, do not add extra fields. You must return a JSON object containing the following two fields:
1. params: Object containing API call parameters, should return empty object {} even if there are no parameters
2. explanation: String, explaining the parameter generation process

Example output format:
{
  "params": {
    "id": "123",
    "limit": 10
  },
  "explanation": "Extracted id and limit parameters from user query"
}

If there are no parameters, return:
{
  "params": {},
  "explanation": "This API requires no parameters"
}${specialInstructions}`;

		// Build user prompt
		const userPrompt = `I need to extract parameters from the following natural language for API call:
API Information: ${apiInfo.method.toUpperCase()} ${apiInfo.path}
User Query: "${naturalLanguage}"

Please extract the parameters needed to call this API.`;

		try {
			// Call AI service to generate parameters
			console.log(`[Parameter Generation:${paramGenId}] Calling AI service...`);
			const result = await aiProvider.generate({
				system: systemPrompt,
				prompt: userPrompt,
				schema: paramsSchema,
			});

			console.log(
				`[Parameter Generation:${paramGenId}] Parameter generation successful: ${result.explanation}`,
			);
			console.log(
				`[Parameter Generation:${paramGenId}] Generated parameters:`,
				JSON.stringify(result.params),
			);

			// Ensure params is not undefined
			const safeParams = result.params || {};

			// Post-process parameters, handle special cases
			const processedParams = this.processGeneratedParams(
				safeParams,
				apiInfo.path,
				naturalLanguage,
			);
			console.log(
				`[Parameter Generation:${paramGenId}] Processed parameters:`,
				JSON.stringify(processedParams),
			);
			console.log(
				`[Parameter Generation:${paramGenId}] ==== Parameter generation completed ====`,
			);

			return processedParams;
		} catch (error) {
			console.error(
				`[Parameter Generation:${paramGenId}] Parameter generation failed:`,
				error,
			);
			console.log(
				`[Parameter Generation:${paramGenId}] ==== Parameter generation failed ====`,
			);
			throw new Error(
				`Failed to generate API parameters: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Process generated parameters, handle special cases
	 */
	private processGeneratedParams(
		params: Record<string, unknown>,
		path: string,
		query: string,
	): Record<string, unknown> {
		const processedParams = { ...params };

		// Handle special case: if path contains {id} and query involves list/all items
		if (
			path.includes("/{id}") &&
			(query.toLowerCase().includes("all") ||
				query.toLowerCase().includes("list") ||
				query.toLowerCase().includes("every"))
		) {
			// If id is not explicitly specified, set it to 'all'
			if (!processedParams.id) {
				processedParams.id = "all";
			}
		}

		return processedParams;
	}

	/**
	 * Call API
	 * @param apiInfo API information
	 * @param params Parameters
	 * @param baseUrl Base URL
	 * @returns API response
	 */
	private async callApi(
		apiInfo: APIInfo,
		params: Record<string, unknown>,
		baseUrl = process.env.API_BASE_URL || "http://localhost:3030",
	): Promise<Record<string, unknown>> {
		const apiCallId = `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		console.log(`[API Call:${apiCallId}] ==== Starting API call ====`);

		try {
			const result = await serverRequest(
				apiInfo.method,
				baseUrl + apiInfo.path,
				params,
			);
			return result as unknown as Record<string, unknown>;
		} catch (error) {
			console.error(`[API Call:${apiCallId}] API call failed:`, error);
			throw error;
		}
	}

	/**
	 * Generate Mermaid render code and Markdown table
	 */
	async generateMermaidRender(
		userQuery: string,
		apiResponse: Record<string, unknown>,
		apiInfo: APIInfo,
	): Promise<MermaidRenderResult> {
		try {
			// Create AI provider
			const aiProvider = new AIProvider(myProvider, "chat-model");

			// Define schema for Mermaid code generation
			const mermaidSchema = z.object({
				mermaidCode: z.string().describe("Complete Mermaid chart code"),
				markdownTable: z
					.string()
					.optional()
					.describe("Optional Markdown table for data presentation"),
				preferredDisplay: z
					.enum(["chart", "table"])
					.describe("Preferred display method"),
			});

			// Build system prompt
			const systemPrompt = `You are a professional data visualization expert, skilled at using Mermaid.js to create charts and generate beautiful data tables.
      
Important: You need to intelligently determine whether to use a chart or table based on the intent of the user's query and the characteristics of the data.

Tables are suitable for scenarios:
- User wants to view list data, detailed data, or raw records
- Data structure is simple, mainly consisting of flat record collections
- User query includes words like "list", "table", or "record"
- Data does not show obvious statistical patterns or comparisons

Charts are suitable for scenarios:
- User explicitly requests statistical analysis, trend, or comparison
- Data contains features suitable for visualization, such as quantity distribution, percentage, time series
- User query includes words like "statistics", "analysis", "percentage", "trend"
- Need to show relationships or patterns between data

Please generate appropriate Mermaid chart code and Markdown table code, and clearly indicate the preferred display method.

Chart type reference:
1. Flowchart (flowchart): Suitable for displaying process, relationship, or structure data
2. Sequence Diagram (sequenceDiagram): Suitable for displaying sequential interactions
3. Class Diagram (classDiagram): Suitable for displaying object relationships
4. Pie Chart (pie): Suitable for percentage data
5. Gantt Chart (gantt): Suitable for time arrangement and progress
6. ER Diagram (erDiagram): Suitable for entity relationships
7. User Journey Diagram (journey): Suitable for user experience process
8. Line Chart (xychart-beta): Suitable for trend data display

Important: When generating Mermaid code, you must follow the following format specifications:
1. If you need to use theme configuration, configuration code must be placed at the beginning
2. Chart type declaration must be placed after configuration, on a separate line
3. Add appropriate colors and styles to the chart, ensuring readability

Please ensure your response includes the following fields:
1. mermaidCode: String, containing complete and correct Mermaid chart code
2. markdownTable: Optional string, containing Markdown table code (if applicable)
3. preferredDisplay: String, must be "chart" or "table", indicating the preferred display method

Note: Please make sure to intelligently decide on the appropriate display method based on the user's query intent and data characteristics, which is more important than simple keyword matching.`;

			// Prepare summary of API response data
			let responseDataSummary = "";
			try {
				responseDataSummary = JSON.stringify(apiResponse).substring(0, 2000);
				if (JSON.stringify(apiResponse).length > 2000) {
					responseDataSummary += "... (data truncated)";
				}
			} catch (e) {
				responseDataSummary = "Unable to serialize API response data";
			}

			// Build user prompt
			const userPrompt = `Based on the following information, generate the most suitable visualization content and decide on the preferred display method (chart or table):

User Query: "${userQuery}"

API Information: ${apiInfo.method.toUpperCase()} ${apiInfo.path}

API Response Data:
${responseDataSummary}

Please analyze the user's query intent and data characteristics to decide whether to use a chart or table to display data. If the user's query involves statistical analysis, percentage, or trend, and the data is suitable for visualization, then use a chart; if the user's query is for list data or detailed records, then use a table.

Regardless of which display method you decide to use, please also generate:
1. Appropriate Mermaid chart code
2. Well-formatted Markdown table

And specify the preferred display method in the preferredDisplay field.`;

			// Call AI service to generate Mermaid code
			const result = await aiProvider.generate({
				system: systemPrompt,
				prompt: userPrompt,
				schema: mermaidSchema,
			});

			console.log("Visualization content generated successfully");
			console.log("Recommended display method:", result.preferredDisplay);

			// Validate and fix generated Mermaid code
			let mermaidCode = result.mermaidCode;

			// Check if chart type declaration is missing
			if (
				!mermaidCode.match(
					/^(flowchart|sequenceDiagram|classDiagram|stateDiagram|entityRelationshipDiagram|journey|gantt|pie|graph|erDiagram|gitGraph|timeline|mindmap|xychart-beta)/m,
				)
			) {
				// Try to extract chart type from code
				const chartTypeMatch = mermaidCode.match(
					/\s*(xychart-beta|pie|flowchart|sequenceDiagram|classDiagram|stateDiagram)[\s\n]/,
				);
				if (chartTypeMatch) {
					const chartType = chartTypeMatch[1];
					// Remove original chart type declaration line
					mermaidCode = mermaidCode.replace(
						new RegExp(`\\s*${chartType}\\s*\\n`, "g"),
						"\n",
					);
					// Add chart type declaration to the beginning
					mermaidCode = `${chartType}\n${mermaidCode}`;
				}
			}

			// Ensure configuration declaration is before chart type
			const configMatch = mermaidCode.match(/%%\{init:.*\}%%/);
			if (configMatch) {
				const configLine = configMatch[0];
				// Remove original configuration line
				mermaidCode = mermaidCode.replace(configLine, "");
				// Move configuration to the beginning
				mermaidCode = `${configLine}\n${mermaidCode}`;
			}

			return {
				success: true,
				mermaidCode: mermaidCode,
				markdownTable: result.markdownTable,
				preferredDisplay: result.preferredDisplay,
			};
		} catch (error) {
			console.error("Mermaid code generation failed:", error);
			return {
				success: false,
				error: `Failed to generate Mermaid code: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Create default API executor
	 */
	static createDefaultApiExecutor(): IApiExecutor {
		return {
			executeApi: async (
				request: ApiRequest,
			): Promise<ApiResponse<Record<string, unknown>>> => {
				try {
					const { method, baseUrl, path, params } = request;
					const url = `${baseUrl}${path}`;
					let response: { data: Record<string, unknown>; status: number };

					switch (method?.toLowerCase()) {
						case "get":
							response = await axios.get(url, { params });
							break;
						case "post":
							response = await axios.post(url, params);
							break;
						case "put":
							response = await axios.put(url, params);
							break;
						case "delete":
							response = await axios.delete(url, { data: params });
							break;
						default:
							throw new Error(`Unsupported HTTP method: ${method}`);
					}

					return {
						success: true,
						data: response.data,
					};
				} catch (error) {
					console.error("API execution failed:", error);
					return {
						success: false,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			},
		};
	}

	/**
	 * Render UI component
	 */
	renderComponent(component: UIComponent): ReactNode {
		const { type, props, children } = component;

		// Render children if present
		const renderedChildren = children?.map((child) =>
			this.renderComponent(child),
		);

		// Get component from context
		const Component = this.context.getComponent(type) as
			| React.ComponentType
			| undefined;
		if (!Component) {
			throw new Error(`Component not found: ${type}`);
		}

		// Render component with props and children
		return this.context.renderComponent(type, {
			...props,
			children: renderedChildren,
		});
	}

	/**
	 * Handle API request
	 */
	async handleRequest(request: ApiRequest): Promise<ApiResponse<unknown>> {
		try {
			// Process request based on type
			switch (request.type) {
				case "render":
					return {
						success: true,
						data: this.renderComponent(request.component as UIComponent),
					};

				case "update":
					// Update component props
					if (request.component && request.props) {
						const component = request.component as UIComponent;
						component.props = {
							...component.props,
							...request.props,
						};
						return {
							success: true,
							data: this.renderComponent(component),
						};
					}
					throw new Error("Invalid update request");

				case "event":
					// Handle component event
					if (request.event && request.handler) {
						const result = await this.handleEvent(
							request.event,
							request.handler,
							request.data,
						);
						return {
							success: true,
							data: result,
						};
					}
					throw new Error("Invalid event request");

				default:
					throw new Error(`Unsupported request type: ${request.type}`);
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Handle component event
	 */
	private async handleEvent(
		event: string,
		handler: string,
		data?: Record<string, unknown>,
	): Promise<unknown> {
		// Get event handler from context
		const eventHandler = this.context.getData(handler) as ((event: string, data?: Record<string, unknown>) => Promise<unknown>) | undefined;
		if (typeof eventHandler !== "function") {
			throw new Error(`Event handler not found: ${handler}`);
		}

		// Execute event handler
		return eventHandler(event, data);
	}

	/**
	 * Create child renderer
	 */
	createChildRenderer(options: RenderOptions = {}): UIRenderer {
		const childContext = options.context || this.context.createChildContext();

		// Apply options
		if (options.theme) {
			childContext.setTheme(options.theme);
		}
		if (options.locale) {
			childContext.setLocale(options.locale);
		}

		return new UIRenderer(childContext as unknown as IApiExecutor);
	}
}

// Create default UI renderer instance
let defaultRenderer: UIRenderer | null = null;

/**
 * Get default UI renderer instance
 */
export function getDefaultRenderer(context: RenderContext): UIRenderer {
	if (!defaultRenderer) {
		const executor: IApiExecutor = {
			executeApi: async (request: ApiRequest) => {
				return {
					success: true,
					data: await serverRequest(
						request.method || "GET",
						request.path || "",
						request.params || {},
					),
				};
			},
		};
		defaultRenderer = new UIRenderer(executor);
	}
	return defaultRenderer;
}

/**
 * Create new UI renderer instance
 */
export function createRenderer(context: RenderContext): UIRenderer {
	const executor: IApiExecutor = {
		executeApi: async (request: ApiRequest) => {
			return {
				success: true,
				data: await serverRequest(
					request.method || "GET",
					request.path || "",
					request.params || {},
				),
			};
		},
	};
	return new UIRenderer(executor);
}
