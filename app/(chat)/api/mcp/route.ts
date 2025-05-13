/**
 * MCP API endpoint
 * Handle browser-side MCP requests
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAPIMCPServer } from "@/lib/mcp/server";
import { initialize as initializeMCP } from "@/lib/mcp";
import type { MCPError, MCPTool } from "@/lib/mcp/types";

// Ensure MCP system initialization
let mcpInitialized = false;

async function ensureMCPInitialized() {
	if (!mcpInitialized) {
		try {
			await initializeMCP();
			mcpInitialized = true;
		} catch (error) {
			console.error("MCP initialization failed:", error);
		}
	}
}

interface JSONRPC2Request {
	jsonrpc: "2.0";
	method: string;
	params?: Record<string, unknown>;
	id: string | number | null;
}

interface JSONRPC2Response {
	jsonrpc: "2.0";
	id: string | number | null;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

export async function POST(request: NextRequest) {
	try {
		// Ensure MCP system is initialized
		await ensureMCPInitialized();

		// Get MCP server instance
		const apiMCPServer = getAPIMCPServer();

		// Parse request body
		const body = (await request.json()) as JSONRPC2Request;

		// Validate JSON-RPC 2.0 request format
		if (!body.jsonrpc || body.jsonrpc !== "2.0" || !body.method) {
			return NextResponse.json<JSONRPC2Response>(
				{
					jsonrpc: "2.0",
					id: body.id || null,
					error: {
						code: -32600,
						message: "Invalid request",
					},
				},
				{ status: 400 },
			);
		}

		// Handle MCP method calls
		switch (body.method) {
			case "initialize":
				return NextResponse.json<JSONRPC2Response>({
					jsonrpc: "2.0",
					id: body.id,
					result: apiMCPServer.getServerInfo(),
				});

			case "listTools": {
				const tools = apiMCPServer.getTools();
				const toolList = tools.map((tool) => ({
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters,
				}));

				return NextResponse.json<JSONRPC2Response>({
					jsonrpc: "2.0",
					id: body.id,
					result: toolList,
				});
			}

			case "callTool":
				if (!body.params?.name) {
					return NextResponse.json<JSONRPC2Response>(
						{
							jsonrpc: "2.0",
							id: body.id,
							error: {
								code: -32602,
								message: "Missing tool name",
							},
						},
						{ status: 400 },
					);
				}

				try {
					const result = await apiMCPServer.executeTool(
						body.params.name as string,
						(body.params.arguments as Record<string, unknown>) || {},
					);

					return NextResponse.json<JSONRPC2Response>({
						jsonrpc: "2.0",
						id: body.id,
						result: {
							content: result,
						},
					});
				} catch (error) {
					const mcpError = error as MCPError;
					return NextResponse.json<JSONRPC2Response>(
						{
							jsonrpc: "2.0",
							id: body.id,
							error: {
								code: -32603,
								message: `Tool execution failed: ${mcpError.message || "Unknown error"}`,
								data: mcpError.details,
							},
						},
						{ status: 500 },
					);
				}

			default:
				return NextResponse.json<JSONRPC2Response>(
					{
						jsonrpc: "2.0",
						id: body.id,
						error: {
							code: -32601,
							message: `Method not found: ${body.method}`,
						},
					},
					{ status: 404 },
				);
		}
	} catch (error) {
		const mcpError = error as MCPError;
		return NextResponse.json<JSONRPC2Response>(
			{
				jsonrpc: "2.0",
				id: null,
				error: {
					code: -32700,
					message: `Parse error: ${mcpError.message || "Unknown error"}`,
					data: mcpError.details,
				},
			},
			{ status: 500 },
		);
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
