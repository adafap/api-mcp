import { MCPClient } from "./client";
import { UIRenderer } from "./core";
import type { ApiRequest, ApiResponse, Tool } from "./types";
import { getAPIMCPServer } from "./server";
// import { initializeMCPWithApps } from "./init";

// MCP initialization status
let initialized = false;

// Transport layer instance
let transport: MCPClient | null = null;

// Default MCP server instance

/**
 * Get or initialize HTTP transport layer
 */
export function getTransport(): MCPClient {
	if (!transport) {
		transport = new MCPClient();
	}
	return transport;
}

/**
 * Initialize MCP service
 */
export async function initialize(): Promise<boolean> {
	if (initialized) return true;

	try {
		const mcpServer = getAPIMCPServer();
		await mcpServer.loadAPITools();
		initialized = true;
		return true;
	} catch (error) {
		console.error("Failed to initialize MCP service:", error);
		return false;
	}
}

/**
 * Get MCP server instance
 */
export function getServer() {
	return getAPIMCPServer();
}

/**
 * Execute MCP tool
 * @param toolId Tool ID
 * @param params Parameters
 * @returns Execution result
 */
export async function callTool(
	toolId: string,
	params: Record<string, unknown> = {},
): Promise<ApiResponse<unknown>> {
	const server = getServer();
	return server.executeTool(toolId, params);
}

/**
 * Get tools list
 * @returns Tools list
 */
export async function listTools(): Promise<Tool[]> {
	const server = getServer();
	return server.getTools();
}

/**
 * Get MCP server information
 * @returns Server information
 */
export async function getServerInfo(): Promise<Record<string, unknown>> {
	const server = getServer();
	return server.getServerInfo();
}

/**
 * Directly process API request
 * @param request API request
 * @returns Processing result
 */
export async function handleRequest(
	request: ApiRequest,
): Promise<ApiResponse<unknown>> {
	try {
		return await UIRenderer.handleRequest(request);
	} catch (error) {
		console.error("MCP request processing failed:", error);
		throw error;
	}
}

/**
 * Execute MCP tool
 */
export async function executeTool(
	name: string,
	params: Record<string, unknown>,
) {
	const server = getServer();
	return server.executeTool(name, params);
}

/**
 * Get registered tools
 */
export function getTools() {
	const server = getServer();
	return server.getTools();
}

// Initialize MCP system
export async function initializeMCP(): Promise<void> {
	await initialize();
}
