/**
 * Server-side request utility
 * Used to execute API requests on the server side to avoid CORS issues
 */

import type { RequestResult } from "./http-client";
import axios from "axios";

/**
 * Execute API request on server side
 * @param method HTTP method
 * @param url API URL
 * @param data Request data
 * @param headers Request headers
 */
export async function serverRequest<T = unknown>(
	method: string,
	url: string,
	data: Record<string, unknown> = {},
	headers: Record<string, string> = {},
): Promise<RequestResult<T>> {
	try {
		console.log(`[ServerRequest] Request: ${method} ${url}`);
		console.log("[ServerRequest] Data:", JSON.stringify(data));

		// Ensure URL is absolute path
		const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3030";
		const absoluteUrl = url.startsWith("http")
			? url
			: `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
		console.log("[ServerRequest] Absolute URL:", absoluteUrl);

		// Use axios to call API directly, avoid using server-side proxy
		try {
			// Create request config
			const axiosConfig = {
				method: method.toUpperCase(),
				url: absoluteUrl,
				...(method.toLowerCase() === "get" ? { params: data } : { data }),
				headers: {
					"Content-Type": "application/json",
					...headers,
				},
				// Add timeout setting
				timeout: 10000, // 10 seconds timeout
				// Allow cross-origin requests with credentials
				withCredentials: false,
				// Explicitly disable proxy
				proxy: false as const,
			};

			console.log(
				"[ServerRequest] Using axios to request directly:",
				JSON.stringify(axiosConfig),
			);
			const response = await axios(axiosConfig);

			console.log("[ServerRequest] Request successful:", response.status);
			return {
				success: true,
				data: response.data,
				status: response.status,
			};
		} catch (axiosError) {
			console.error(
				"[ServerRequest] Axios request failed:",
				axiosError instanceof Error ? axiosError.message : "Unknown error",
			);

			const typedError = axiosError as {
				response?: {
					status: number;
					data: {
						message?: string;
						error?: string;
					};
				};
				request?: unknown;
			};

			if (typedError.response) {
				console.log(
					"[ServerRequest] Response status:",
					typedError.response.status,
				);
				console.log(
					"[ServerRequest] Response data:",
					JSON.stringify(typedError.response.data),
				);
			} else if (typedError.request) {
				console.log("[ServerRequest] Request sent but no response");
			}

			// Add more detailed error information
			const errorMessage =
				typedError.response?.data?.message ||
				typedError.response?.data?.error ||
				(axiosError instanceof Error ? axiosError.message : "Request failed");

			return {
				success: false,
				error: true,
				message: errorMessage,
				status: typedError.response?.status,
				data: typedError.response?.data as T,
				code: axiosError instanceof Error ? axiosError.name : "REQUEST_ERROR",
			};
		}
	} catch (error) {
		console.error("[ServerRequest] Error:", error);
		// Handle request error
		return {
			success: false,
			error: true,
			message:
				error instanceof Error ? error.message : "Request execution failed",
			code: "REQUEST_ERROR",
		};
	}
}
