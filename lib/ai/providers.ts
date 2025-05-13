import {
	customProvider,
	extractReasoningMiddleware,
	wrapLanguageModel,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

const openRouter = createOpenRouter({
	apiKey: OPENROUTER_KEY,
});

// Use OpenRouter's Qwen Plus model
export const myProvider = customProvider({
	languageModels: {
		"chat-model": openRouter("qwen/qwen-plus"),
		"chat-model-reasoning": wrapLanguageModel({
			model: openRouter("qwen/qwen-plus"),
			middleware: extractReasoningMiddleware({ tagName: "think" }),
		}),
		"title-model": openRouter("qwen/qwen-plus"),
		"artifact-model": openRouter("qwen/qwen-plus"),
	},
});
