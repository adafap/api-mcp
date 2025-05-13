import type { APIInfo, ErrorAnalysisResult, IErrorAnalyzer } from "../types";
import { AIProvider, AIProviderAdapter } from "./ai-provider";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { AIClient } from "../types";

/**
 * Error Analyzer
 * Responsible for analyzing API errors and providing solutions
 */
export class ErrorAnalyzer implements IErrorAnalyzer {
	private aiProvider: AIClient;

	constructor() {
		const provider = new AIProvider(myProvider, "chat-model");
		this.aiProvider = new AIProviderAdapter(provider);
	}

	/**
	 * Analyze API error
	 * @param error Error object
	 * @param apiInfo API information
	 * @param params Request parameters
	 * @returns Error analysis result
	 */
	async analyzeError(
		error: unknown,
		apiInfo: APIInfo,
		params: Record<string, unknown>,
	): Promise<ErrorAnalysisResult> {
		const analysisId = `error_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		console.log(`[ErrorAnalyzer:${analysisId}] Starting error analysis`);

		// Error message formatting
		let errorMessage = "";
		let errorCode = "";
		let statusCode = "";
		let rawError = "";

		try {
			// Try to extract error information
			if (error instanceof Error) {
				errorMessage = error.message;
				rawError = error.stack || error.message;
			} else if (typeof error === "string") {
				errorMessage = error;
				rawError = error;
			} else if (error && typeof error === "object") {
				const errorObj = error as Record<string, unknown>;
				errorMessage =
					(errorObj.message as string) ||
					(errorObj.msg as string) ||
					(errorObj.error as string) ||
					JSON.stringify(error);
				errorCode = String(errorObj.code || errorObj.status || "");
				statusCode = String(errorObj.statusCode || errorObj.status || "");
				rawError = JSON.stringify(error, null, 2);
			} else {
				errorMessage = "Unknown error";
				rawError = String(error);
			}

			// Get error context
			const errorContext = this.getErrorContext(error);

			// Define Zod schema for error analysis
			const errorAnalysisZod = z.object({
				errorType: z.string().describe("Error type"),
				errorMessage: z.string().describe("Error message"),
				suggestion: z.string().describe("Suggestion"),
				possibleSolutions: z.array(z.string()).describe("Possible solutions"),
				isFatal: z.boolean().describe("Is fatal error"),
				relatedFields: z
					.array(z.string())
					.optional()
					.describe("Related fields"),
				renderAs: z
					.enum(["message", "card", "notification"])
					.describe("Render method"),
				retryStrategy: z
					.object({
						shouldRetry: z.boolean().describe("Should retry"),
						retryParams: z
							.record(z.unknown())
							.optional()
							.describe("Retry parameters"),
						alternatePath: z.string().optional().describe("Alternative path"),
					})
					.describe("Retry strategy"),
			});

			// Build system prompt
			const systemPrompt = `You are a professional API error analysis expert, skilled at analyzing various API errors and providing solutions.
      
Task: Analyze the given API error, determine the error type, provide solution suggestions, and evaluate if retry is possible.

Error Analysis Guidelines:
1. Determine error type (authentication error, parameter error, server error, network error, etc.)
2. Clearly explain the error cause
3. Provide specific solution suggestions
4. Determine if related to specific parameters
5. Evaluate error severity
6. Suggest best user interface presentation method
7. Determine if retry with modified parameters is possible

Note: You must return a strictly formatted JSON object containing the following fields:
- errorType: string, indicating error type
- errorMessage: string, indicating error message
- suggestion: string, indicating suggestion
- possibleSolutions: array, containing possible solution strings
- isFatal: boolean, indicating if error is fatal
- renderAs: enum string, possible values: message, card, notification
- retryStrategy: object, containing shouldRetry (boolean) and optional retryParams (object), alternatePath (string)

Special emphasis:
1. possibleSolutions must be a string array, e.g., ["Solution 1", "Solution 2", "Solution 3"]
2. retryStrategy must be an object, e.g., {"shouldRetry": true, "alternatePath": "/api/alternative"}

Analysis should be detailed, accurate, and provide practically valuable solutions.`;

			// Prepare API parameter information
			const paramInfo = Object.entries(params || {})
				.map(([name, value]) => {
					return `- ${name}: ${JSON.stringify(value)}`;
				})
				.join("\n");

			// Build user prompt
			const userPrompt = `Please analyze the following API error and provide solutions:

API Information:
- Endpoint: ${apiInfo.method.toUpperCase()} ${apiInfo.path}
- Description: ${apiInfo.description || "No description"}

Request Parameters:
${paramInfo || "No parameters"}

Error Information:
- Error Message: ${errorMessage}
${errorCode ? `- Error Code: ${errorCode}` : ""}
${statusCode ? `- Status Code: ${statusCode}` : ""}

Raw Error:
${rawError}

Error Context:
${errorContext}

Please analyze this error, determine its type, cause, and provide detailed solutions.`;

			// Call AI service to analyze error
			const analysis = (await this.aiProvider.generate({
				system: systemPrompt,
				prompt: userPrompt,
				schema: errorAnalysisZod,
			})) as z.infer<typeof errorAnalysisZod>;

			console.log(
				`[ErrorAnalyzer:${analysisId}] Error analysis successful, error type: ${analysis.errorType}`,
			);

			return {
				success: true,
				...analysis,
			};
		} catch (analysisError) {
			console.error(
				`[ErrorAnalyzer:${analysisId}] Error analysis failed:`,
				analysisError,
			);

			// Return basic error analysis result
			return {
				success: false,
				errorType: "unknown",
				errorMessage: errorMessage || "Unknown error",
				suggestion: "Please contact administrator or try again later",
				possibleSolutions: [
					"Retry request",
					"Check network connection",
					"Contact system administrator",
				],
				isFatal: true,
				renderAs: "message",
				retryStrategy: {
					shouldRetry: false,
				},
			};
		}
	}

	/**
	 * Get error context
	 * @param error Error object
	 * @returns Error context string
	 */
	private getErrorContext(error: unknown): string {
		try {
			if (!error) return "No error context";

			// Network error
			if (
				typeof error === "object" &&
				error !== null &&
				"isAxiosError" in error
			) {
				const axiosError = error as unknown as {
					response?: {
						status: number;
						statusText: string;
						headers: Record<string, unknown>;
						data: unknown;
					};
					message: string;
					config: Record<string, unknown>;
				};

				const response = axiosError.response;
				if (response) {
					return `Network request failed:
- Status Code: ${response.status}
- Status Text: ${response.statusText}
- Response Headers: ${JSON.stringify(response.headers)}
- Response Data: ${JSON.stringify(response.data)}`;
				}

				return `Network request failed:
- Error Message: ${axiosError.message}
- Request Config: ${JSON.stringify(axiosError.config)}`;
			}

			// Common error types
			if (error instanceof TypeError) {
				return `Type error: ${error.message}`;
			}

			if (error instanceof SyntaxError) {
				return `Syntax error: ${error.message}`;
			}

			if (error instanceof ReferenceError) {
				return `Reference error: ${error.message}`;
			}

			// General error
			if (error instanceof Error && error.stack) {
				return `Error stack: ${error.stack}`;
			}

			return "Unable to extract detailed error context";
		} catch (e) {
			return "Error context extraction failed";
		}
	}
}
