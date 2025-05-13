/**
 * Parameter error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class ParamErrorStrategy implements ErrorStrategy {
	name = "param-error";
	description = "Handle request parameter related errors";

	canHandle(context: ErrorContext): boolean {
		const { error } = context;

		// Check if it's an Axios error
		if (axios.isAxiosError(error)) {
			// Check if status code is 400
			return error.response?.status === 400;
		}

		return false;
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error } = context;
		let message = "Invalid request parameters";
		let details = null;

		// Try to extract more detailed error information from response
		if (axios.isAxiosError(error) && error.response?.data) {
			const data = error.response.data;

			// Parse common API error formats
			if (data.message) {
				message = data.message;
			} else if (data.error) {
				message =
					typeof data.error === "string"
						? data.error
						: "Invalid request parameters";
			}

			// Extract field-level error information
			if (data.errors || data.fields || data.fieldErrors) {
				details = data.errors || data.fields || data.fieldErrors;
			}
		}

		return {
			success: false,
			error: true,
			message,
			code: "INVALID_PARAMETERS",
			data: details,
		};
	}
}
