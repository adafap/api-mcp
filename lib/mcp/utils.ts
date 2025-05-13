/**
 * MCP Tool Utility Functions
 */

import axios, { type AxiosResponse } from "axios";
import { camelCase } from "lodash";
import type { Tool, ApiResponse } from "./types";

interface AppInfo {
	id: string;
	swaggerUrl?: string;
}

interface ParameterDefinition {
	type: string;
	description: string;
	required: boolean;
}

interface ApiParameters {
	path?: Record<string, ParameterDefinition>;
	query?: Record<string, ParameterDefinition>;
	body?: {
		items: Record<string, ParameterDefinition>;
	};
}

interface DataSource {
	params: string | ApiParameters;
}

/**
 * Convert API path to camelCase
 */
export function pathToCamelCase(path: string): string {
	// Remove leading and trailing slashes
	let normalized = path.replace(/^\/+|\/+$/g, "");

	// Remove version number part (like /api/v1/, /v2/)
	normalized = normalized.replace(/\/?(api\/)?v\d+\/?/, "");

	// Convert to camelCase
	return camelCase(normalized);
}

/**
 * Create unique tool ID
 */
export function createUniqueToolId(
	appPrefix: string,
	method: string,
	path: string,
	existingTools: Set<string>,
): string {
	// Use path to generate camelCase tool ID
	const pathName = pathToCamelCase(path);

	// Create base tool ID
	const baseToolId = `api_${appPrefix}${pathName}`;

	// Ensure ID is unique
	let finalToolId = baseToolId;
	let counter = 1;
	while (existingTools.has(finalToolId)) {
		finalToolId = `${baseToolId}_${counter++}`;
	}

	return finalToolId;
}

/**
 * Extract base URL from app
 */
export function extractBaseUrlFromApp(app: AppInfo): string {
	try {
		if (app.swaggerUrl) {
			const url = new URL(app.swaggerUrl);
			return url.origin;
		}
	} catch (error) {
		// Ignore URL parsing errors
	}
	return "";
}

/**
 * Parse parameter definitions
 */
export function parseParameterDefinitions(
	dataSource: DataSource,
): Record<string, ParameterDefinition> {
	const parameterDefinitions: Record<string, ParameterDefinition> = {};

	try {
		let params = dataSource.params;
		if (typeof params === "string") {
			params = JSON.parse(params) as ApiParameters;
		}

		// Parse path parameters
		if (params?.path) {
			addParametersToDefinition(
				parameterDefinitions,
				params.path,
				"Path parameter",
			);
		}

		// Parse query parameters
		if (params?.query) {
			addParametersToDefinition(
				parameterDefinitions,
				params.query,
				"Query parameter",
			);
		}

		// Parse request body parameters
		if (params?.body?.items) {
			addParametersToDefinition(
				parameterDefinitions,
				params.body.items,
				"Request body parameter",
			);
		}
	} catch (error) {
		// Ignore parameter parsing errors, continue registering tool
	}

	return parameterDefinitions;
}

/**
 * Add parameters to definition
 */
export function addParametersToDefinition(
	definitions: Record<string, ParameterDefinition>,
	params: Record<string, ParameterDefinition>,
	paramType: string,
): void {
	for (const [key, param] of Object.entries(params)) {
		definitions[key] = {
			type: (
				param.type || (paramType.includes("body") ? "object" : "string")
			).toLowerCase(),
			description: param.description || `${paramType}: ${key}`,
			required: Boolean(param.required),
		};
	}
}

/**
 * Check required tool parameters
 */
export function checkRequiredParameters(
	tool: Tool,
	params: Record<string, unknown>,
): string | null {
	if (!tool.parameters) return null;

	for (const [key, def] of Object.entries(tool.parameters || {})) {
		if (
			(def as ParameterDefinition).required &&
			(params[key] === undefined || params[key] === null)
		) {
			return key;
		}
	}

	return null;
}

/**
 * Standardize tool execution result
 */
export function standardizeResult<T>(result: unknown): ApiResponse<T> {
	if (result === undefined || result === null) {
		return { success: true, data: undefined };
	}

	// Ensure object result has success flag
	if (typeof result === "object" && result !== null) {
		const resultObj = result as Record<string, unknown>;
		if (!("success" in resultObj)) {
			return { success: true, data: result as T };
		}
		return result as ApiResponse<T>;
	}

	return { success: true, data: result as T };
}

/**
 * Execute HTTP request
 */
export async function executeHttpRequest(
	method: string,
	url: string,
	params: Record<string, unknown>,
): Promise<AxiosResponse> {
	switch (method.toLowerCase()) {
		case "get":
			return await axios.get(url, { params });
		case "post":
			return await axios.post(url, params);
		case "put":
			return await axios.put(url, params);
		case "delete":
			return await axios.delete(url, { data: params });
		default:
			throw new Error(`Unsupported HTTP method: ${method}`);
	}
}

/**
 * Register weather query example tool
 */
export function registerWeatherTool(
	server: {
		registerTool: (tool: Tool) => void;
	},
	toolsRegistered: Set<string>,
): void {
	const toolId = "api_example_weather";
	if (toolsRegistered.has(toolId)) return;

	server.registerTool({
		name: toolId,
		description: "Query weather information for a specified city",
		parameters: {
			city: {
				type: "string",
				description: "City name, e.g., Beijing, Shanghai",
				required: true,
			},
		},
		execute: async (
			params: Record<string, unknown>,
		): Promise<ApiResponse<unknown>> => {
			try {
				return {
					success: true,
					data: {
						city: params.city,
						weather: "Sunny",
						temperature: "25°C",
						humidity: "60%",
						wind: "NE 3",
					},
				};
			} catch (error) {
				return {
					success: false,
					error: "Error occurred",
					message: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
	});

	toolsRegistered.add(toolId);
}

/**
 * Register translation example tool
 */
export function registerTranslateTool(
	server: {
		registerTool: (tool: Tool) => void;
	},
	toolsRegistered: Set<string>,
): void {
	const toolId = "api_example_translate";
	if (toolsRegistered.has(toolId)) return;

	server.registerTool({
		name: toolId,
		description: "Translate text from one language to another",
		parameters: {
			text: {
				type: "string",
				description: "Text to translate",
				required: true,
			},
			source: {
				type: "string",
				description: "Source language, e.g., zh (Chinese), en (English)",
				required: false,
			},
			target: {
				type: "string",
				description: "Target language, e.g., zh (Chinese), en (English)",
				required: true,
			},
		},
		execute: async (
			params: Record<string, unknown>,
		): Promise<ApiResponse<unknown>> => {
			try {
				const result = `${params.text} (translated to ${params.target})`;
				return {
					success: true,
					data: {
						translated: result,
						source: params.source || "auto-detect",
						target: params.target,
					},
				};
			} catch (error) {
				return {
					success: false,
					error: "Error occurred",
					message: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
	});

	toolsRegistered.add(toolId);
}
