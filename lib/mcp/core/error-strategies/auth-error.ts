/**
 * Authentication error handling strategy
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from "./types";
import axios from "axios";

export class AuthErrorStrategy implements ErrorStrategy {
	name = "auth-error";
	description = "Handle authentication and authorization related errors";

	canHandle(context: ErrorContext): boolean {
		const { error } = context;

		// Check if it's an Axios error
		if (axios.isAxiosError(error)) {
			// Check if status code is 401 or 403
			return error.response?.status === 401 || error.response?.status === 403;
		}

		return false;
	}

	handle(context: ErrorContext): ErrorResponse {
		const { error } = context;
		const status = axios.isAxiosError(error) ? error.response?.status : null;

		if (status === 401) {
			return {
				success: false,
				error: true,
				message:
					"You are not logged in or your session has expired, please log in again",
				code: "UNAUTHORIZED",
				data: error.response?.data,
			};
		}
		
		return {
			success: false,
			error: true,
			message: "You do not have permission to perform this operation",
			code: "FORBIDDEN",
			data: error.response?.data,
		};
	}
}
