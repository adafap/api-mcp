import axios from "axios";

/**
 * Client API Adapter
 * Provides safe API calling methods to avoid directly importing server-only modules in the client
 */
export const apiClient = {
	/**
	 * Submit form data
	 * @param formData Form data
	 * @param apiInfo API information
	 * @returns Submission result
	 */
	async submitForm(
		formData: Record<string, unknown>,
		apiInfo: {
			serviceId: string;
			apiId: string;
			method: string;
			path: string;
			baseUrl?: string;
		},
	) {
		try {
			const response = await axios.post("/api/form-submit", {
				formData,
				apiInfo,
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error submitting form",
				message: "Form submission failed",
			};
		}
	},

	/**
	 * Execute MCP tool
	 * @param toolId Tool ID
	 * @param params Parameters
	 * @returns Execution result
	 */
	async executeTool(toolId: string, params: Record<string, unknown> = {}) {
		try {
			const response = await axios.post("/api/mcp/execute-tool", {
				toolId,
				params,
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			return {
				success: false,
				error: true,
				message:
					error instanceof Error ? error.message : "Error executing tool",
			};
		}
	},

	/**
	 * Process natural language query
	 * @param request API request
	 * @returns Processing result
	 */
	async processQuery(request: Record<string, unknown>) {
		try {
			const response = await axios.post("/api/mcp/process", { request });
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			return {
				success: false,
				error: true,
				message:
					error instanceof Error ? error.message : "Error processing query",
			};
		}
	},
};
