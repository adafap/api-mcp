import {
	type UIMessage,
	appendResponseMessages,
	createDataStreamResponse,
	smoothStream,
	streamText,
	tool,
	type Tool as AITool,
	type Message,
	type ToolResult,
	type Attachment,
	type Tool,
} from "ai";
import { systemPrompt } from "@/lib/ai/prompts";
import {
	deleteChatById,
	getChatById,
	saveChat,
	saveMessages,
} from "@/lib/db/queries";
import {
	generateUUID,
	getMostRecentUserMessage,
	getTrailingMessageId,
} from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { isProductionEnvironment } from "@/lib/constants";
import { myProvider } from "@/lib/ai/providers";
import { getAPIMCPServer } from "@/lib/mcp/server";
import { initialize as initializeMCP, initialize } from "@/lib/mcp";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type {
	Tool as MCPTool,
	MCPToolResult,
	MCPToolParameter,
} from "@/lib/mcp/types";

export const maxDuration = 60;

type DynamicToolsMap = Record<
	string,
	Tool<
		z.ZodObject<Record<string, z.ZodTypeAny>>,
		{ name: string; content: string }
	>
>;

// Define ResponseMessage type locally
type ResponseMessage = Message & {
	role: "assistant";
	id: string;
};

// Initialize MCP on application startup
(async () => {
	try {
		console.log("Pre-initializing MCP system on application startup...");
		await initializeMCP();
		await initialize();

		// Verify MCP tools are loaded
		const mcpServer = getAPIMCPServer();
		const tools = mcpServer.getTools();
		console.log(`MCP initialized with ${tools.length} tools available`);
		for (const tool of tools) {
			console.log(`- ${tool.name}: ${tool.description}`);
		}
	} catch (error) {
		console.error(
			"MCP system pre-initialization failed, will retry on first request:",
			error,
		);
	}
})();

export async function POST(request: Request) {
	try {
		const {
			id,
			messages,
			selectedChatModel,
		}: {
			id: string;
			messages: Array<UIMessage>;
			selectedChatModel: string;
		} = await request.json();

		const userMessage = getMostRecentUserMessage(messages);

		if (!userMessage) {
			return new Response("No user message found", { status: 400 });
		}

		// Initialize chat
		await handleChatSaving(id, userMessage);

		// Ensure MCP is initialized
		const mcpServer = getAPIMCPServer();
		const mcpTools = mcpServer.getTools();

		// Convert MCP tools to AI framework format
		const { allTools, activeToolNames } = prepareAITools(
			mcpTools,
			mcpServer,
			userMessage,
		);

		return createDataStreamResponse({
			execute: async (dataStream) => {
				try {
					const result = streamText({
						model: myProvider.languageModel(selectedChatModel),
						system: systemPrompt({ selectedChatModel }),
						messages,
						maxSteps: 10,
						experimental_activeTools: activeToolNames,
						experimental_transform: smoothStream({ chunking: "word" }),
						experimental_generateMessageId: generateUUID,
						tools: allTools,
						onFinish: async ({ response }) => {
							await saveAssistantMessage(id, userMessage, {
								messages: response.messages as Message[],
							});
						},
						experimental_telemetry: {
							isEnabled: isProductionEnvironment,
							functionId: "stream-text",
						},
					});

					result.consumeStream();
					result.mergeIntoDataStream(dataStream, { sendReasoning: true });
				} catch (error) {
					console.error("AI stream processing error:", error);
				}
			},
			onError: (error) => {
				console.error("API processing error:", error);
				return `Error processing request: ${error || "Unknown error"}`;
			},
		});
	} catch (error) {
		console.error("API processing error:", error);
		return new Response("Error processing request!", {
			status: 400,
		});
	}
}

/**
 * Handle chat saving
 */
async function handleChatSaving(id: string, userMessage: UIMessage) {
	const chat = await getChatById({ id });

	if (!chat) {
		const title = await generateTitleFromUserMessage({ message: userMessage });
		await saveChat({ id, userId: "demo-user", title });
	}

	await saveMessages({
		messages: [
			{
				id: userMessage.id || randomUUID(),
				chatId: id,
				role: "user",
				parts: userMessage.parts,
				attachments:
					userMessage.experimental_attachments?.map(transformAttachment) ?? [],
				createdAt: new Date(),
			},
		],
	});
}

/**
 * Save assistant message
 */
async function saveAssistantMessage(
	chatId: string,
	userMessage: UIMessage,
	response: { messages: Message[] },
) {
	try {
		const assistantId = getTrailingMessageId({
			messages: response.messages.filter(
				(message): message is ResponseMessage => message.role === "assistant",
			),
		});

		if (!assistantId) {
			throw new Error("Assistant message not found");
		}

		const [, assistantMessage] = appendResponseMessages({
			messages: [userMessage],
			responseMessages: response.messages as ResponseMessage[],
		});

		await saveMessages({
			messages: [
				{
					id: assistantId,
					chatId,
					role: assistantMessage.role,
					//@ts-ignore
					parts: assistantMessage.parts,
					attachments:
						assistantMessage.experimental_attachments?.map(
							transformAttachment,
						) ?? [],
					createdAt: new Date(),
				},
			],
		});
	} catch (error) {
		console.error("Failed to save assistant message:", error);
	}
}

/**
 * Prepare AI tools
 */
function prepareAITools(
	mcpTools: MCPTool[],
	mcpServer: {
		executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
	},
	userMessage: UIMessage,
) {
	const allTools: Record<string, AITool> = {};

	console.log(`Preparing ${mcpTools.length} MCP tools for AI...`);

	// Convert MCP tools to AI framework format
	for (const mcpTool of mcpTools) {
		console.log(`Converting tool: ${mcpTool.name}`);
		const params = createZodSchemaFromParameters(
			mcpTool.parameters as unknown as MCPToolParameter,
		);
		allTools[mcpTool.name] = tool({
			description: mcpTool.description,
			parameters: params,
			execute: async (args: Record<string, unknown>) => {
				try {
					console.log(`Executing tool ${mcpTool.name} with args:`, args);
					const toolParams = {
						...args,
						userQuery: userMessage?.content || "",
					};

					const result = await mcpServer.executeTool(mcpTool.name, {
						...toolParams,
						baseUrl: process.env.API_BASE_URL || "http://localhost:3030",
					});

					console.log(`Tool ${mcpTool.name} execution result:`, result);

					if (
						result &&
						typeof result === "object" &&
						("mermaidCode" in result || "markdownTable" in result)
					) {
						const mcpResult = result as MCPToolResult;
						return {
							name: mcpTool.name,
							content: JSON.stringify({
								...mcpResult,
								_visualizationComplete: true,
								_type: mcpResult.mermaidCode ? "mermaid" : "markdown",
								_length:
									(mcpResult.mermaidCode?.length || 0) +
									(mcpResult.markdownTable?.length || 0),
							}),
						};
					}
					return { name: mcpTool.name, content: JSON.stringify(result) };
				} catch (error) {
					console.error(`Tool ${mcpTool.name} execution failed:`, error);
					throw error;
				}
			},
		});
	}

	return {
		allTools,
		activeToolNames: Object.keys(allTools),
	};
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return new Response("Not Found", { status: 404 });
	}

	try {
		await deleteChatById({ id });
		return new Response("Chat deleted", { status: 200 });
	} catch (error) {
		return new Response("An error occurred while processing your request!", {
			status: 500,
		});
	}
}

/**
 * Convert parameter definitions to zod schema
 */
function createZodSchemaFromParameters(
	params: MCPToolParameter,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const schemaObj: Record<string, z.ZodTypeAny> = {};

	// MCPToolParameter itself is the properties object
	for (const [key, param] of Object.entries(params)) {
		if (typeof param === "object" && param !== null && "type" in param) {
			const paramDef = param as { type: string; required?: boolean };
			const schema = getZodType(paramDef.type || "string"); // Provide default type
			schemaObj[key] = paramDef.required ? schema : schema.optional();
		}
	}

	return z.object(schemaObj);
}

function getZodType(type: unknown): z.ZodTypeAny {
	// 确保type是字符串类型
	if (typeof type !== "string") {
		console.warn(`非字符串类型的参数: ${type}，使用默认字符串类型`);
		return z.string();
	}

	switch (type.toLowerCase()) {
		case "string":
			return z.string();
		case "number":
			return z.number();
		case "boolean":
			return z.boolean();
		case "object":
			return z.record(z.unknown());
		case "array":
			return z.array(z.unknown());
		default:
			return z.string(); // Default to string type
	}
}

/**
 * Transform attachment to the required format
 */
function transformAttachment(att: Attachment): {
	type: string;
	url: string;
	name: string;
} {
	return {
		type: "file",
		url: att.url,
		name: att.name || `file-${Date.now()}`,
	};
}
