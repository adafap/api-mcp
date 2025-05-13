/**
 * SwaggerClient
 * Provides utilities for interacting with Swagger API endpoints
 */

import axios from "axios";
import type { ISwagger } from "./types";

/**
 * Client options for Swagger API calls
 */
export interface SwaggerClientOptions {
	baseUrl?: string;
	timeout?: number;
	headers?: Record<string, string>;
}

/**
 * Client for making Swagger API requests
 */
export class SwaggerClient {
	private options: SwaggerClientOptions;

	constructor(options: SwaggerClientOptions = {}) {
		this.options = {
			timeout: 5000,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			...options,
		};
	}

	/**
	 * Fetch Swagger document from URL
	 */
	async fetchSwaggerDoc(url: string): Promise<ISwagger> {
		try {
			const response = await axios.get(url, {
				timeout: this.options.timeout,
				headers: this.options.headers,
			});

			return response.data;
		} catch (error) {
			throw new Error(
				`Failed to fetch Swagger document: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Make API call to Swagger endpoint
	 */
	async callEndpoint(
		method: string,
		path: string,
		params?: Record<string, unknown>,
	): Promise<unknown> {
		try {
			const baseUrl = this.options.baseUrl || "";
			const url = `${baseUrl}${path}`;

			const response = await axios({
				method,
				url,
				params: method === "GET" ? params : undefined,
				data: method !== "GET" ? params : undefined,
				timeout: this.options.timeout,
				headers: this.options.headers,
			});

			return response.data;
		} catch (error) {
			throw new Error(
				`API call failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}

export default SwaggerClient;
