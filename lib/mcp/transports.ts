/**
 * MCP Transport Layer Implementation
 * Supports HTTP/REST transport for browser environments
 */

import type { ApiRequest, ApiResponse, Tool } from "./types";
import { serverRequest } from "./core/server-request";
import type { MCPServer } from "./server";

// Message type definition
interface Message {
	jsonrpc: string;
	id?: string | number;
	method?: string;
	params?: Record<string, unknown>;
	result?: Record<string, unknown>;
	error?: {
		code: number;
		message: string;
		data?: Record<string, unknown>;
	};
}

/**
 * MCP Transport Base Class
 */
abstract class MCPTransport {
	protected apiServer: MCPServer;

	constructor(apiServer: MCPServer) {
		this.apiServer = apiServer;
	}

	protected abstract initialize(): void;
	protected abstract sendMessage(message: Message): void;

	/**
	 * Handle received request messages
	 */
	protected async handleRequest(message: Message): Promise<Message> {
		try {
			if (!message.method) {
				return this.createErrorResponse(message.id, -32600, "Invalid request");
			}

			if (message.method === "callTool") {
				const result = await this.apiServer.handleRequest({
					type: "tool",
					tool: message.params?.name as string,
					params: (message.params?.arguments as Record<string, unknown>) || {},
				});

				return {
					jsonrpc: "2.0",
					id: message.id,
					result: (result.data || {}) as Record<string, unknown>,
				};
			}

			return this.createErrorResponse(
				message.id,
				-32601,
				`Method not found: ${message.method}`,
			);
		} catch (error) {
			return this.createErrorResponse(
				message.id,
				-32603,
				error instanceof Error ? error.message : "Internal error",
			);
		}
	}

	/**
	 * Create error response
	 */
	protected createErrorResponse(
		id: string | number | undefined,
		code: number,
		message: string,
	): Message {
		return {
			jsonrpc: "2.0",
			id,
			error: {
				code,
				message,
			},
		};
	}
}

/**
 * HTTP/REST API Transport
 * Suitable for browser environments
 */
export class HttpTransport extends MCPTransport {
	private apiEndpoint: string;
	private headers: Record<string, string>;

	constructor(
		apiServer: MCPServer,
		baseUrl = "/api/mcp",
		headers: Record<string, string> = {},
	) {
		super(apiServer);
		this.apiEndpoint = baseUrl;
		this.headers = headers;
	}

	protected initialize(): void {
		// HTTP transport does not require initialization
	}

	protected async sendMessage(message: Message): Promise<Message> {
		try {
			const response = await serverRequest<Message>(
				"POST",
				`${this.apiEndpoint}/api/mcp`,
				message as unknown as Record<string, unknown>,
				this.headers,
			);

			if (!response.success) {
				throw new Error(response.message || "Request failed");
			}

			return response.data as Message;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return this.createErrorResponse(
				message.id,
				-32603,
				`Request failed: ${errorMessage}`,
			);
		}
	}

	/**
	 * Call MCP tool
	 */
	public async callTool(
		name: string,
		args: Record<string, unknown> = {},
	): Promise<ApiResponse<unknown>> {
		const message: Message = {
			jsonrpc: "2.0",
			id: Date.now(),
			method: "callTool",
			params: {
				name,
				arguments: args,
			},
		};

		const response = await this.sendMessage(message);
		return (response.result as { content: ApiResponse<unknown> }).content;
	}

	/**
	 * Get server information
	 */
	public async getServerInfo(): Promise<Record<string, unknown>> {
		const message: Message = {
			jsonrpc: "2.0",
			id: Date.now(),
			method: "initialize",
		};

		const response = await this.sendMessage(message);
		return response.result as Record<string, unknown>;
	}

	/**
	 * Get available tools list
	 */
	public async listTools(): Promise<Tool[]> {
		const message: Message = {
			jsonrpc: "2.0",
			id: Date.now(),
			method: "listTools",
		};

		const response = await this.sendMessage(message);
		return (response.result as { tools: Tool[] }).tools;
	}

	/**
	 * Set request headers
	 */
	setHeaders(headers: Record<string, string>): void {
		this.headers = { ...this.headers, ...headers };
	}

	/**
	 * Get current headers
	 */
	getHeaders(): Record<string, string> {
		return { ...this.headers };
	}
}

/**
 * WebSocket Transport
 * Handles WebSocket-based MCP communication
 */
export class WebSocketTransport {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private messageHandlers = new Map<
		string,
		(response: ApiResponse<unknown>) => void
	>();

	constructor(url: string) {
		this.url = url;
	}

	/**
	 * Connect to WebSocket server
	 */
	async connect(): Promise<boolean> {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return true;
		}

		return new Promise((resolve) => {
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				console.log("WebSocket connected");
				this.reconnectAttempts = 0;
				resolve(true);
			};

			this.ws.onclose = () => {
				console.log("WebSocket disconnected");
				this.handleDisconnect().catch(console.error);
				resolve(false);
			};

			this.ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				resolve(false);
			};

			this.ws.onmessage = (event) => {
				try {
					const response = JSON.parse(event.data) as ApiResponse<unknown>;
					const messageId = response.id as string;
					const handler = this.messageHandlers.get(messageId);
					if (handler) {
						handler(response);
						this.messageHandlers.delete(messageId);
					}
				} catch (error) {
					console.error("Failed to handle WebSocket message:", error);
				}
			};
		});
	}

	/**
	 * Send request through WebSocket
	 */
	async sendRequest(request: ApiRequest): Promise<ApiResponse<unknown>> {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			const connected = await this.connect();
			if (!connected) {
				throw new Error("Failed to connect to WebSocket server");
			}
		}

		return new Promise((resolve, reject) => {
			const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			this.messageHandlers.set(messageId, resolve);

			try {
				this.ws?.send(
					JSON.stringify({
						...request,
						id: messageId,
					}),
				);
			} catch (error) {
				this.messageHandlers.delete(messageId);
				reject(error);
			}

			// Add timeout
			setTimeout(() => {
				this.messageHandlers.delete(messageId);
				reject(new Error("Request timeout"));
			}, 30000);
		});
	}

	/**
	 * Handle WebSocket disconnection
	 */
	private async handleDisconnect(): Promise<void> {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.log("Max reconnection attempts reached");
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);

		console.log(`Attempting to reconnect in ${delay}ms...`);
		await new Promise((resolve) => setTimeout(resolve, delay));

		await this.connect();
	}

	/**
	 * Close WebSocket connection
	 */
	close(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}

// Create transport factory
export function createTransport(
	type: "http" | "websocket",
	options: {
		baseUrl?: string;
		headers?: Record<string, string>;
		apiServer?: MCPServer;
	} = {},
): HttpTransport | WebSocketTransport {
	const { baseUrl, headers, apiServer } = options;

	if (!apiServer) {
		throw new Error("apiServer is required");
	}

	switch (type) {
		case "http":
			return new HttpTransport(apiServer, baseUrl, headers);
		case "websocket":
			return new WebSocketTransport(baseUrl || "ws://localhost:3030/ws");
		default:
			throw new Error(`Unsupported transport type: ${type}`);
	}
}
