/**
 * Default error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class DefaultErrorStrategy implements ErrorStrategy {
	name = "default-error";
	description = "Handle errors not caught by other strategies";

	canHandle(context: ErrorContext): boolean {
		// Always return true as fallback strategy
		return true;
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error } = context;

		let message = "An unknown error occurred";
		let details = null;
		let code = "UNKNOWN_ERROR";

		// Try to extract more useful error information
		if (axios.isAxiosError(error)) {
			if (error.response) {
				message = `Request failed with status: ${error.response.status}`;
				details = error.response.data;
				code = `HTTP_ERROR_${error.response.status}`;
			} else if (error.request) {
				message = "No response received from server";
				code = "NO_RESPONSE";
			} else {
				message = `Request configuration error: ${error.message}`;
				code = "REQUEST_CONFIG_ERROR";
			}
		} else if (error instanceof Error) {
			message = error.message || "Unknown error";
			// If stack trace is available, record it for debugging
			if (error.stack) {
				details = { stack: error.stack };
			}
		}

		return {
			success: false,
			error: true,
			message,
			code,
			data: details,
		};
	}
}
