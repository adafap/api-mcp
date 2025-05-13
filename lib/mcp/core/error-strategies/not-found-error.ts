/**
 * Resource not found error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class NotFoundErrorStrategy implements ErrorStrategy {
	name = "not-found-error";
	description = "Handle resource not found errors";

	canHandle(context: ErrorContext): boolean {
		const { error } = context;

		// Check if it's an Axios error
		if (axios.isAxiosError(error)) {
			// Check if status code is 404
			return error.response?.status === 404;
		}

		return false;
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error, url } = context;

		return {
			success: false,
			error: true,
			message: `Resource not found: ${url}`,
			code: "RESOURCE_NOT_FOUND",
			data: axios.isAxiosError(error) ? error.response?.data : null,
		};
	}
}
