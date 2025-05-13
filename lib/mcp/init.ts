import { getAppsByUserId } from "@/lib/db/queries";
import { getDataSourcesByAppId } from "@/lib/db/queries";
import { getAPIMCPServer } from "./server";
import type { Tool } from "./types";
import { z } from "zod";

// Track initialization status
// let initialized = false;

interface Parameter {
	type: string;
	description?: string;
	required?: boolean;
}

interface DataSource {
	id: string;
	appId: string;
	title: string;
	description?: string;
	method: string;
	path: string;
	params?: {
		path?: Record<string, Parameter>;
		query?: Record<string, Parameter>;
		body?: Record<string, Parameter>;
	};
	createdAt: Date;
}

/**
 * Convert parameters to Zod schema
 */
function createParameterSchema(params: Record<string, unknown>) {
	const schemaObj: Record<string, z.ZodTypeAny> = {};

	for (const [key, param] of Object.entries(params)) {
		if (typeof param === "object" && param !== null) {
			const paramDef = param as {
				type: string;
				required?: boolean;
				description?: string;
			};
			if (paramDef.type === "string") {
				schemaObj[key] = paramDef.required ? z.string() : z.string().optional();
			} else if (paramDef.type === "number") {
				schemaObj[key] = paramDef.required ? z.number() : z.number().optional();
			} else if (paramDef.type === "boolean") {
				schemaObj[key] = paramDef.required
					? z.boolean()
					: z.boolean().optional();
			} else {
				schemaObj[key] = z.any();
			}
		}
	}

	return z.object(schemaObj);
}

/**
 * Generate a readable tool name from path and method
 */
function generateToolName(
	method: string,
	path: string,
	appName: string,
): string {
	if (!path) return "api";

	// Remove leading and trailing slashes
	let cleanPath = path.replace(/^\/|\/$/g, "");

	// Remove version number part (like /api/v1/, /v2/)
	cleanPath = cleanPath.replace(/^(api\/)?v\d+\//, "");

	// Split path into segments
	const segments = cleanPath.split("/");

	// Filter out empty segments and parameter segments
	const filteredSegments = segments.filter(
		(seg) => seg && !seg.startsWith(":") && !seg.startsWith("{"),
	);

	// Convert to camelCase
	let result = "";
	for (const segment of filteredSegments) {
		// Replace non-alphanumeric characters with space
		const cleanSegment = segment.replace(/[^a-zA-Z0-9]/g, " ");
		// Split into words
		const words = cleanSegment.split(" ").filter((w) => w);

		for (const [index, word] of words.entries()) {
			if (result === "" && index === 0) {
				// First word starts with lowercase
				result += word.toLowerCase();
			} else {
				// Other words start with uppercase
				result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}
		}
	}

	// Add HTTP method prefix (for non-GET methods)
	if (method.toLowerCase() !== "get" && result) {
		result =
			method.toLowerCase() + result.charAt(0).toUpperCase() + result.slice(1);
	}

	// Add app name prefix
	const prefix = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "")}_`;

	return `${prefix}${result || "api"}`;
}

/**
 * Convert a data source to an MCP tool
 */
function convertDataSourceToTool(
	dataSource: DataSource,
	appName: string,
): Tool {
	const toolName = generateToolName(
		dataSource.method,
		dataSource.path,
		appName,
	);

	// Prepare parameter definitions
	const parameterDefinitions: Record<string, Parameter> = {};

	// Add path parameters
	if (dataSource.params?.path) {
		for (const [key, param] of Object.entries(dataSource.params.path)) {
			parameterDefinitions[key] = {
				type: (param.type || "string").toLowerCase(),
				description: param.description || `Path parameter: ${key}`,
				required: Boolean(param.required),
			};
		}
	}

	// Add query parameters
	if (dataSource.params?.query) {
		for (const [key, param] of Object.entries(dataSource.params.query)) {
			parameterDefinitions[key] = {
				type: (param.type || "string").toLowerCase(),
				description: param.description || `Query parameter: ${key}`,
				required: Boolean(param.required),
			};
		}
	}

	// Add body parameters
	if (dataSource.params?.body) {
		for (const [key, param] of Object.entries(dataSource.params.body)) {
			parameterDefinitions[key] = {
				type: (param.type || "object").toLowerCase(),
				description: param.description || `Body parameter: ${key}`,
				required: Boolean(param.required),
			};
		}
	}

	const tool: Tool = {
		name: toolName,
		description: `${dataSource.description || dataSource.title} (${dataSource.method.toUpperCase()} ${dataSource.path})`,
		parameters: {
			type: "object",
			properties: parameterDefinitions,
			required: Object.entries(parameterDefinitions)
				.filter(([_, param]) => param.required)
				.map(([key]) => key),
		},
		execute: async (params: Record<string, unknown>) => {
			try {
				// Get base URL from environment or use default
				const baseUrl = process.env.API_BASE_URL || "http://localhost:3030";
				const fullPath = new URL(dataSource.path, baseUrl).toString();

				// Handle different HTTP methods appropriately
				const config: RequestInit = {
					method: dataSource.method.toUpperCase(),
					headers: {
						"Content-Type": "application/json",
					},
				};

				// Only add body for methods that support it
				if (!["GET", "HEAD"].includes(dataSource.method.toUpperCase())) {
					config.body = JSON.stringify(params);
				}

				const response = await fetch(fullPath, config);

				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}`);
				}

				const result = await response.json();

				return {
					success: true,
					data: result,
					metadata: {
						source: dataSource.title,
						method: dataSource.method,
						path: dataSource.path,
					},
				};
			} catch (error) {
				console.error(`Failed to execute API ${dataSource.title}:`, error);
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					metadata: {
						source: dataSource.title,
						method: dataSource.method,
						path: dataSource.path,
					},
				};
			}
		},
	};
	return tool;
}

// /**
//  * Initialize MCP system
//  * 1. Load enabled applications from database
//  * 2. Get data sources for each application
//  * 3. Convert data sources to MCP tools
//  * 4. Register tools to MCP server
//  */
// export async function initializeMCPWithApps(): Promise<void> {
// 	// Prevent multiple initializations
// 	if (initialized) {
// 		console.log("MCP system already initialized, skipping...");
// 		return;
// 	}

// 	try {
// 		console.log("Starting MCP system initialization...");

// 		// Get MCP server instance
// 		const mcpServer = getAPIMCPServer();

// 		// Clear existing tools before initialization
// 		mcpServer.tools.clear();

// 		// Get all enabled applications
// 		const apps = await getAppsByUserId({ userId: "demo-user" });
// 		console.log(`Found ${apps.length} applications:`, apps);

// 		// Process each application
// 		for (const app of apps) {
// 			if (!app.enabled) {
// 				console.log(`Application ${app.name} is disabled, skipping`);
// 				continue;
// 			}

// 			console.log(`Processing application: ${app.name} (${app.id})`);

// 			// Get application data sources
// 			const dataSources = await getDataSourcesByAppId({ appId: app.id });
// 			console.log(
// 				`Application ${app.name} has ${dataSources.length} data sources:`,
// 				dataSources,
// 			);

// 			// Convert and register each data source as a tool
// 			for (const dataSource of dataSources) {
// 				const tool = convertDataSourceToTool(dataSource, app.name);
// 				mcpServer.registerTool(tool);
// 				console.log(`Registered tool: ${tool.name} (${tool.description})`);
// 			}
// 		}

// 		// Verify tools registration
// 		const registeredTools = mcpServer.getTools();
// 		console.log(`MCP system initialized with ${registeredTools.length} tools`);
// 		for (const tool of registeredTools) {
// 			console.log(`- ${tool.name}: ${tool.description}`);
// 		}

// 		// Mark as initialized
// 		initialized = true;
// 	} catch (error) {
// 		console.error("MCP system initialization failed:", error);
// 		throw error;
// 	}
// }
