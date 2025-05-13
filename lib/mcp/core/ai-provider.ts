import { generateObject } from "ai";
import { z } from "zod";
import type { AIClient } from "../types";

/**
 * Adapter for Vercel AI SDK
 * Connects to Vercel AI SDK to implement AI model calls
 */
export class AIProvider {
	private aiClient: AIClient;
	private defaultModel: string;

	/**
	 * Constructor
	 * @param provider AI client provider
	 * @param defaultModel Default model name
	 */
	constructor(
		provider: {
			languageModel(
				modelId:
					| "chat-model"
					| "chat-model-reasoning"
					| "title-model"
					| "artifact-model",
			): unknown;
			textEmbeddingModel(modelId: string): unknown;
			imageModel(modelId: string): unknown;
		},
		defaultModel:
			| "chat-model"
			| "chat-model-reasoning"
			| "title-model"
			| "artifact-model" = "chat-model",
	) {
		this.aiClient = {
			...provider,
			generate: async (options) => {
				const model = provider.languageModel(defaultModel);
				return options.schema.parse(model);
			},
			streamObject: async (options) => {
				const model = provider.languageModel(options.model as "chat-model");
				return { objectStream: JSON.stringify(model) };
			},
		};
		this.defaultModel = defaultModel;
	}

	/**
	 * Generate non-streaming AI response
	 * @param options Generation options
	 * @returns Generation result
	 */
	async generate<T>({
		model,
		system,
		prompt,
		schema,
	}: {
		model?: string;
		system: string;
		prompt: string;
		schema: z.ZodType<T>;
	}): Promise<T> {
		const genId = `gen_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		try {
			console.log(`[AIProvider:${genId}] Starting AI response generation`);
			console.log(`[AIProvider:${genId}] Model: ${model || this.defaultModel}`);
			console.log(`[AIProvider:${genId}] Prompt length: ${prompt.length}`);

			if (prompt.length > 10000) {
				console.warn(
					`[AIProvider:${genId}] Prompt content too long: ${prompt.length} characters`,
				);
			}

			const modelToUse = model || this.defaultModel;
			console.time(`[AIProvider:${genId}] AI generation time`);

			const enhancedSystem = `${system}

Important: Your response must be a strictly formatted JSON object containing all required fields. Ensure arrays are correctly represented as JSON arrays and objects as JSON objects. For example:
- Correct array: ["option1", "option2", "option3"]
- Incorrect array: "option1, option2, option3" or "- option1\\n- option2\\n- option3"
- Correct object: {"key1": value1, "key2": value2}
- Incorrect object: "key1: value1, key2: value2" or string format

Please strictly follow this format to ensure the output is valid JSON.`;
			const result = await this.aiClient.streamObject({
				model: modelToUse as
					| "chat-model"
					| "chat-model-reasoning"
					| "title-model"
					| "artifact-model",
				system: enhancedSystem,
				prompt,
				schema,
			});

			console.timeEnd(`[AIProvider:${genId}] AI generation time`);
			console.log(`[AIProvider:${genId}] AI generation successful`);

			return schema.parse(JSON.parse(result.objectStream)) as T;
		} catch (error) {
			console.error(`[AIProvider:${genId}] AI generation failed:`, error);
			throw new Error(
				`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate streaming AI response
	 * @param options Generation options
	 * @returns Streaming generation result
	 */
	async generateStream<T>({
		model,
		system,
		prompt,
		schema,
	}: {
		model?: string;
		system: string;
		prompt: string;
		schema: z.ZodType<T>;
	}): Promise<ReadableStream<string>> {
		const streamId = `stream_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		try {
			console.log(`[AIProvider:Stream:${streamId}] Starting stream generation`);
			console.log(
				`[AIProvider:Stream:${streamId}] Model: ${model || this.defaultModel}`,
			);
			console.log(
				`[AIProvider:Stream:${streamId}] Prompt length: ${prompt.length}`,
			);

			// Add additional JSON format guidance to system prompt
			const enhancedSystem = `${system}

Important: Your response must be a strictly formatted JSON object containing all required fields. Ensure arrays are correctly represented as JSON arrays and objects as JSON objects.`;

			// Use Vercel AI SDK's streaming call
			const modelToUse = model || this.defaultModel;
			console.time(`[AIProvider:Stream:${streamId}] Stream generation start`);

			// Use streamObject for streaming call
			const { objectStream } = await this.aiClient.streamObject({
				model: modelToUse as
					| "chat-model"
					| "chat-model-reasoning"
					| "title-model"
					| "artifact-model",
				system: enhancedSystem,
				prompt,
				schema,
			});

			console.timeEnd(
				`[AIProvider:Stream:${streamId}] Stream generation start`,
			);
			console.log(
				`[AIProvider:Stream:${streamId}] Stream generation initialized`,
			);
			return new ReadableStream({
				start(controller) {
					controller.enqueue(objectStream);
					controller.close();
				},
			});
		} catch (error: unknown) {
			console.error(
				`[AIProvider:Stream:${streamId}] Stream generation failed:`,
				error,
			);
			throw new Error(
				`AI stream generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async generateStructuredOutput<T>({
		prompt,
		schema,
	}: {
		prompt: string;
		schema: z.ZodType<T>;
	}): Promise<{
		success: boolean;
		data?: T;
		error?: {
			message: string;
			code: string;
		};
	}> {
		const streamId = `stream_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

		try {
			const { objectStream } = await this.aiClient.streamObject({
				model: this.defaultModel as
					| "chat-model"
					| "chat-model-reasoning"
					| "title-model"
					| "artifact-model",
				system:
					"Your response must be a strictly formatted JSON object containing all required fields.",
				prompt,
				schema,
			});
			const parsedData = schema.parse(JSON.parse(objectStream));

			return {
				success: true,
				data: parsedData,
			};
		} catch (error) {
			console.error(
				`[AIProvider:Stream:${streamId}] Stream generation failed:`,
				error,
			);
			return {
				success: false,
				error: {
					message:
						error instanceof Error ? error.message : "Unknown error occurred",
					code: "STREAM_GENERATION_FAILED",
				},
			};
		}
	}
}

export class AIProviderAdapter implements AIClient {
	constructor(private provider: AIProvider) {}

	languageModel(
		modelId:
			| "chat-model"
			| "chat-model-reasoning"
			| "title-model"
			| "artifact-model",
	): unknown {
		return this.provider.generate({
			model: modelId,
			system: "You are a helpful AI assistant.",
			prompt: "",
			schema: z.any(),
		});
	}

	textEmbeddingModel(modelId: string): unknown {
		return this.provider.generate({
			model: modelId,
			system: "You are a helpful AI assistant.",
			prompt: "",
			schema: z.any(),
		});
	}
	imageModel(modelId: string): unknown {
		return this.provider.generate({
			model: modelId,
			system: "You are a helpful AI assistant.",
			prompt: "",
			schema: z.any(),
		});
	}

	generate(options: {
		system: string;
		prompt: string;
		schema: z.ZodType<unknown>;
	}): Promise<unknown> {
		return this.provider.generate(options);
	}

	streamObject<T>(options: {
		model: unknown;
		system: string;
		prompt: string;
		schema: z.ZodType<T>;
	}): Promise<{ objectStream: string }> {
		return this.provider
			.generateStream({
				...options,
				model: options.model as string,
			})
			.then((stream) => ({ objectStream: stream.toString() }));
	}
}
