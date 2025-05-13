/**
 * Connection error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class ConnectionErrorStrategy implements ErrorStrategy {
	name = "connection-error";
	description = "Handle network connection related errors";

	canHandle(context: ErrorContext): boolean {
		const { error } = context;

		// Check if it's an Axios error with no response
		if (axios.isAxiosError(error)) {
			return !error.response && Boolean(error.request);
		}

		// Check if it's a network error
		return (
			error instanceof Error &&
			(error.message.includes("Network Error") ||
				error.message.includes("ECONNREFUSED") ||
				error.message.includes("ECONNABORTED") ||
				error.message.includes("ETIMEDOUT"))
		);
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error, retryCount = 0, url } = context;

		// Determine error type to provide more accurate message
		let message = "Network connection error";
		let code = "NETWORK_ERROR";

		if (axios.isAxiosError(error)) {
			if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
				message = "Request timeout, please check your network connection";
				code = "REQUEST_TIMEOUT";
			} else if (error.message.includes("Network Error")) {
				message = "Network error, please check your network connection";
				code = "NETWORK_ERROR";
			}
		}

		// Consider retry for network errors
		const shouldRetry = retryCount < 3;

		return {
			success: false,
			error: true,
			message: `${message} (${url})`,
			code,
			shouldRetry,
			retryDelay: shouldRetry ? 2 ** retryCount * 1000 : undefined, // Exponential backoff strategy
		};
	}
}
