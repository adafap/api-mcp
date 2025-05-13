/**
 * Swagger API Handler
 * Provides utilities for handling Swagger API operations
 */

import type {
	ICodeResponse,
	IDataSource,
	IDataSourceConfig,
} from "@/types/data-source";
import type { ISwagger, IOperation } from "./types";

/**
 * Handler for Swagger operation responses
 */
export class ResponseHandler {
	constructor(private swagger: ISwagger) {}

	/**
	 * Handles API response parsing
	 * @param response API response object
	 * @returns Processed response
	 */
	handleResponse(response: Record<string, unknown>): ICodeResponse | null {
		if (!response) return null;

		return {
			code: String(response.code || 200),
			type: response.type as string,
			properties: {},
			title: (response.description as string) || "",
		};
	}
}

/**
 * Handler for Swagger operations
 */
export class OperationHandler {
	constructor(private config: Record<string, unknown>) {}

	/**
	 * Processes an API operation
	 * @param operation The operation to process
	 * @returns Processed operation config
	 */
	processOperation(operation: IOperation): Partial<IDataSourceConfig> {
		return {
			title: operation.summary || "",
			description: operation.description || "",
			tags: operation.tags || [],
		};
	}
}

export default {
	ResponseHandler,
	OperationHandler,
};
