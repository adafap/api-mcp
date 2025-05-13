import type {
	ApiRequest,
	ApiResponse,
	Tool,
	RenderContext,
	DataSource,
} from "./types";
import { UIRenderer } from "./core";
import { getDataSourcesByAppId, getAppsByUserId } from "@/lib/db/queries";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";

/**
 * MCP Server
 * Handles MCP requests and manages tools
 */

interface ServerOptions {
	baseUrl?: string;
	tools?: Tool[];
	context?: RenderContext;
}

type RequestType = "tool" | "render" | "update" | "event";

interface ExtendedApiRequest extends ApiRequest {
	type: RequestType;
	tool?: string;
	params?: Record<string, unknown>;
}

interface VisualizationResult {
	type: "mermaid" | "form" | "table";
	content: string | Record<string, unknown>;
	explanation: string;
}

export class MCPServer {
	private tools = new Map<string, Tool>();
	private renderer: UIRenderer;
	private baseUrl: string;

	constructor(options: ServerOptions = {}) {
		this.baseUrl = options.baseUrl || "http://localhost:3030";

		const apiExecutor = {
			executeApi: async (
				request: ApiRequest,
			): Promise<ApiResponse<unknown>> => {
				return this.handleRequest(request);
			},
		};

		this.renderer = new UIRenderer(apiExecutor);

		if (options.tools) {
			for (const tool of options.tools) {
				this.registerTool(tool);
			}
		}
	}

	/**
	 * Register tool
	 */
	registerTool(tool: Tool): void {
		if (this.tools.has(tool.name)) {
			throw new Error(`Tool already registered: ${tool.name}`);
		}
		this.tools.set(tool.name, tool);
	}

	/**
	 * Get tool by name
	 */
	getTool(name: string): Tool | undefined {
		return this.tools.get(name);
	}

	/**
	 * Get all registered tools
	 */
	getTools(): Tool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Handle API request
	 */
	async handleRequest(request: ApiRequest): Promise<ApiResponse<unknown>> {
		try {
			switch (request.type) {
				case "tool":
					return await this.handleToolRequest(request);
				case "render":
					return await this.renderer.handleRequest(request);
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
	 * Handle tool request
	 */
	private async handleToolRequest(
		request: ApiRequest,
	): Promise<ApiResponse<unknown>> {
		const { tool: toolName, params } = request;

		if (!toolName) {
			throw new Error("Tool name is required");
		}

		const tool = this.getTool(toolName);
		if (!tool) {
			throw new Error(`Tool not found: ${toolName}`);
		}
		try {
			const result = await tool.execute(params ?? {});
			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Tool execution failed",
			};
		}
	}

	/**
	 * Get server information
	 */
	getServerInfo(): Record<string, unknown> {
		return {
			version: "1.0.0",
			baseUrl: this.baseUrl,
			toolCount: this.tools.size,
		};
	}

	async executeTool(
		toolId: string,
		params: Record<string, unknown>,
	): Promise<ApiResponse<unknown>> {
		return this.handleRequest({
			type: "tool",
			tool: toolId,
			params,
		});
	}

	/**
	 * Load and register API tools from database
	 */
	async loadAPITools(): Promise<void> {
		// Clear existing tools
		this.tools.clear();

		// Get all enabled applications
		const apps = await getAppsByUserId({ userId: "demo-user" });

		// Process each application
		for (const app of apps) {
			if (!app.enabled) continue;

			// Get application data sources
			const dataSources = await getDataSourcesByAppId({ appId: app.id });

			// Convert each data source to a tool
			for (const ds of dataSources) {
				const toolName = `${app.name.toLowerCase()}_${ds.method.toLowerCase()}_${ds.path.replace(/[^a-zA-Z0-9]/g, "_")}`;

				this.registerTool({
					name: toolName,
					description: `${ds.description || ds.title} (${ds.method.toUpperCase()} ${ds.path})`,
					parameters: {
						...ds.params,
					},
					execute: async (params: Record<string, unknown>) => {
						try {
							const baseUrl =
								process.env.API_BASE_URL || "http://localhost:3030";
							const fullPath = new URL(ds.path, baseUrl).toString();

							const config: RequestInit = {
								method: ds.method.toUpperCase(),
								headers: {
									"Content-Type": "application/json",
								},
							};

							const response = await fetch(fullPath, config);
							const data = await response.json();

							// 使用用户的原始查询作为可视化描述
							const userDescription = params.userQuery as string | undefined;
							console.log(
								`API调用执行, 工具名称: ${toolName}, 使用用户原始查询作为可视化描述: ${userDescription || "无"}`,
							);

							// 调用 AI 转换数据，传入用户原始查询作为描述
							const visualization = await transformDataToVisualization(
								data,
								ds.title,
								userDescription,
							);

							if (visualization) {
								return {
									success: true,
									data,
									visualization,
									metadata: {
										source: ds.title,
										method: ds.method,
										path: ds.path,
									},
								};
							}

							return {
								success: true,
								data,
								metadata: {
									source: ds.title,
									method: ds.method,
									path: ds.path,
								},
							};
						} catch (error) {
							return {
								success: false,
								error: error instanceof Error ? error.message : "Unknown error",
								metadata: {
									source: ds.title,
									method: ds.method,
									path: ds.path,
								},
							};
						}
					},
				});
			}
		}
	}
}

// Create default MCP server instance
let defaultServer: MCPServer | null = null;

/**
 * Get default MCP server instance
 */
export function getDefaultServer(options?: ServerOptions): MCPServer {
	if (!defaultServer) {
		defaultServer = new MCPServer(options);
	}
	return defaultServer;
}

/**
 * Create new MCP server instance
 */
export function createServer(options?: ServerOptions): MCPServer {
	return new MCPServer(options);
}

// Singleton instance for API MCP server
let apiMCPServer: MCPServer | null = null;

// Get or create API MCP server instance
export function getAPIMCPServer(): MCPServer {
	if (!apiMCPServer) {
		apiMCPServer = new MCPServer();
	}
	return apiMCPServer;
}

// Initialize MCP system
export async function initializeMCP(): Promise<void> {
	const server = getAPIMCPServer();
	// Add initialization logic here
	console.log("MCP system initialized");
}

async function transformDataToVisualization(
	data: Record<string, unknown>,
	dataSource: string,
	userDescription?: string,
): Promise<VisualizationResult | null> {
	try {
		// 使用AI判断用户意图并选择可视化方式
		const { object } = await generateObject({
			model: myProvider.languageModel("chat-model"),
			system:
				"您是一位专业的数据可视化专家，也精通用户意图分析。您的任务是分析用户的查询意图，并将API响应数据转化为最合适的可视化格式。您需要基于用户描述判断最合适的可视化方式，而不仅仅依赖于数据结构。",
			prompt: `数据来源: ${dataSource}
数据内容: ${JSON.stringify(data, null, 2)}
用户描述: ${userDescription || ""}

请分析用户的意图和数据内容，选择最合适的可视化格式:

1. 如果用户意图与填写表单、输入数据、提交信息等操作相关，请创建表单格式(form)，让用户能够交互和输入数据。
2. 如果用户意图与数据关系、趋势分析、流程图等可视化分析相关，请创建合适的mermaid图表(mermaid)。
3. 如果用户意图与查看结构化数据、比较数据等相关，请创建表格格式(table)展示数据。

请根据用户意图和数据特点选择最合适的一种格式。

如果选择表单(form)，请确保包含以下元素:
- title: 表单标题
- description: 表单目的简要说明
- fields: 字段对象数组，每个对象包含以下属性:
  - name: 字段标识符
  - label: 显示标签
  - type: "text", "textarea", "number", "boolean", "select", "radio"等类型
  - placeholder: 占位文本
  - description: 字段帮助文本
  - required: 是否必填
  - options: 对于select/radio字段，提供{value, label}对象数组

如果选择图表(mermaid)，请确保遵循mermaid.js语法，并准确表示数据。

如果选择表格(table)，请以Markdown表格格式提供，确保列对齐和标题行正确。`,
			schema: z.object({
				type: z
					.enum(["mermaid", "form", "table"])
					.describe("要使用的可视化类型"),
				content: z.union([
					z.string().describe("mermaid图表或markdown表格的内容"),
					z.record(z.unknown()).describe("表单交互的模式定义"),
				]),
				explanation: z.string().describe("选择此可视化方式的简要说明"),
			}),
		});

		return object as VisualizationResult;
	} catch (error) {
		console.error("AI transformation failed:", error);
		return null;
	}
}

export async function createDataSourceTools(dataSources: DataSource[]) {
	return dataSources.map((ds) => ({
		name: ds.id,
		description: ds.description,
		parameters: {
			...ds.parameters,
		},
		execute: async (params: Record<string, unknown>) => {
			try {
				const baseUrl = process.env.API_BASE_URL || "http://localhost:3030";
				const fullPath = new URL(ds.path, baseUrl).toString();

				const config: RequestInit = {
					method: ds.method.toUpperCase(),
					headers: {
						"Content-Type": "application/json",
					},
				};

				const response = await fetch(fullPath, config);
				const data = await response.json();

				// 使用用户的原始查询作为可视化描述
				const userDescription = params.userQuery as string | undefined;
				console.log(
					`API调用执行, 工具名称: ${ds.id}, 使用用户原始查询作为可视化描述: ${userDescription || "无"}`,
				);

				// 调用 AI 转换数据，传入用户原始查询作为描述
				const visualization = await transformDataToVisualization(
					data,
					ds.title,
					userDescription,
				);

				if (visualization) {
					return {
						success: true,
						data,
						visualization,
						metadata: {
							source: ds.title,
							method: ds.method,
							path: ds.path,
						},
					};
				}

				return {
					success: true,
					data,
					metadata: {
						source: ds.title,
						method: ds.method,
						path: ds.path,
					},
				};
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					metadata: {
						source: ds.title,
						method: ds.method,
						path: ds.path,
					},
				};
			}
		},
	}));
}
