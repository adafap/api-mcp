/**
 * Swagger API Integration
 * Provides utilities for generating APIs from Swagger documents
 */

import { SwaggerClient } from "./swagger-client";
import type { ISwagger, IOperation } from "./types";

/**
 * Swagger API operation configuration
 */
export interface SwaggerAPIOperation {
	method: string;
	path: string;
	operation: IOperation;
}

/**
 * Swagger API configuration
 */
export interface SwaggerAPIConfig {
	basePath?: string;
	operations: SwaggerAPIOperation[];
}

/**
 * Swagger API generator and executor
 */
export class SwaggerAPI {
	private client: SwaggerClient;
	private config: SwaggerAPIConfig;

	constructor(swagger: ISwagger, clientOptions = {}) {
		this.client = new SwaggerClient({
			baseUrl: this.getBaseUrl(swagger),
			...clientOptions,
		});

		this.config = {
			basePath: swagger.basePath || "",
			operations: this.extractOperations(swagger),
		};
	}

	/**
	 * Get base URL from Swagger document
	 */
	private getBaseUrl(swagger: ISwagger): string {
		const schemes = swagger.schemes || ["https"];
		const scheme = schemes[0];
		const host = swagger.host || "localhost";
		const basePath = swagger.basePath || "";

		return `${scheme}://${host}${basePath}`;
	}

	/**
	 * Extract operations from Swagger paths
	 */
	private extractOperations(swagger: ISwagger): SwaggerAPIOperation[] {
		const operations: SwaggerAPIOperation[] = [];
		const paths = swagger.paths || {};

		for (const [path, pathObject] of Object.entries(paths)) {
			for (const [method, operation] of Object.entries(pathObject)) {
				// Skip non-standard fields that might be in the paths object
				if (
					![
						"get",
						"post",
						"put",
						"delete",
						"patch",
						"options",
						"head",
					].includes(method)
				) {
					continue;
				}

				operations.push({
					method,
					path,
					operation: operation as IOperation,
				});
			}
		}

		return operations;
	}

	/**
	 * Call API operation by operationId
	 */
	async callOperation(
		operationId: string,
		params: Record<string, unknown> = {},
	): Promise<unknown> {
		const operation = this.config.operations.find(
			(op) => op.operation.operationId === operationId,
		);

		if (!operation) {
			throw new Error(`Operation not found: ${operationId}`);
		}

		return this.client.callEndpoint(operation.method, operation.path, params);
	}
}

export default SwaggerAPI;
