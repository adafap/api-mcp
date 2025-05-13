/**
 * Server error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class ServerErrorStrategy implements ErrorStrategy {
	name = "server-error";
	description = "Handle server internal errors";

	canHandle(context: ErrorContext): boolean {
		const { error } = context;

		// Check if it's an Axios error
		if (axios.isAxiosError(error)) {
			// Check if status code is 5xx
			const status = error.response?.status || 0;
			return status >= 500 && status < 600;
		}

		return false;
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error, retryCount = 0 } = context;
		const status = axios.isAxiosError(error) ? error.response?.status : null;

		// Consider retry for specific errors
		const shouldRetry =
			retryCount < 3 && (status === 502 || status === 503 || status === 504);

		let message = "Internal server error";
		if (status === 502) {
			message = "Service temporarily unavailable, please try again later";
		} else if (status === 503) {
			message = "Service under maintenance, please try again later";
		} else if (status === 504) {
			message = "Service response timeout, please try again later";
		}

		return {
			success: false,
			error: true,
			message,
			code: `SERVER_ERROR_${status || 500}`,
			data: axios.isAxiosError(error) ? error.response?.data : null,
			shouldRetry,
			retryDelay: shouldRetry ? 2 ** retryCount * 1000 : undefined, // Exponential backoff strategy
		};
	}
}
