/**
 * MCP Browser Client
 * Used for calling MCP tools in browser environment
 */

import axios from "axios";
import type { Tool, ApiResponse } from "./types";
import { z } from "zod";

interface MCPTool extends Tool {
	inputSchema: z.ZodObject<z.ZodRawShape>;
}

export class MCPClient {
	private apiEndpoint: string;
	private tools: MCPTool[] = [];
	private messageId = 0;

	constructor(apiEndpoint = "/api/mcp") {
		// Use relative path for same-origin requests
		this.apiEndpoint = apiEndpoint;
	}

	/**
	 * Initialize client
	 */
	public async initialize(): Promise<boolean> {
		try {
			// Get server information
			await this.getServerInfo();

			// Get available tools list
			const tools = await this.listTools();
			this.tools = tools.map((tool) => ({
				...tool,
				inputSchema: z.object({}),
			}));

			return true;
		} catch (error) {
			console.error("Failed to initialize MCP client:", error);
			return false;
		}
	}

	/**
	 * Send JSON-RPC request to server
	 */
	private async sendRequest(
		method: string,
		params: Record<string, unknown> = {},
	): Promise<unknown> {
		const id = `mcp-${Date.now()}-${this.messageId++}`;

		try {
			const response = await axios.post(
				this.apiEndpoint,
				{
					jsonrpc: "2.0",
					id,
					method,
					params,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const result = response.data;

			if (result.error) {
				throw new Error(result.error.message || "Unknown error");
			}

			return result.result;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.data?.error) {
				throw new Error(error.response.data.error.message || "Server error");
			}
			throw error;
		}
	}

	/**
	 * Get server information
	 */
	public async getServerInfo(): Promise<Record<string, unknown>> {
		return this.sendRequest("initialize") as Promise<Record<string, unknown>>;
	}

	/**
	 * Get available tools list
	 */
	public async listTools(): Promise<Tool[]> {
		const result = await this.sendRequest("listTools");
		return (result as { tools: Tool[] })?.tools || [];
	}

	/**
	 * Call MCP tool
	 * @param toolName Tool name
	 * @param args Arguments object
	 */
	public async callTool(
		toolName: string,
		args: Record<string, unknown> = {},
	): Promise<ApiResponse<unknown>> {
		// Check if tool exists
		if (
			this.tools.length > 0 &&
			!this.tools.some((tool) => tool.name === toolName)
		) {
			throw new Error(`Tool does not exist: ${toolName}`);
		}

		const result = await this.sendRequest("callTool", {
			name: toolName,
			arguments: args,
		});

		return (result as { content: unknown })?.content as ApiResponse<unknown>;
	}

	/**
	 * Get loaded tools list
	 */
	public getTools(): MCPTool[] {
		return this.tools;
	}
}

// Create default MCP client instance
let defaultMCPClient: MCPClient | null = null;

/**
 * Get default MCP client instance
 */
export function getMCPClient(apiEndpoint?: string): MCPClient {
	if (!defaultMCPClient) {
		defaultMCPClient = new MCPClient(apiEndpoint);
	}
	return defaultMCPClient;
}

/**
 * Create new MCP client instance
 */
export function createMCPClient(apiEndpoint?: string): MCPClient {
	return new MCPClient(apiEndpoint);
}
