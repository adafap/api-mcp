/**
 * MCP增强型HTTP客户端
 * 集成错误处理策略，支持智能重试机制，兼容各种接口格式
 */

import axios, {
	type InternalAxiosRequestConfig,
	type AxiosRequestConfig,
	type AxiosResponse,
	type Method,
	type AxiosInstance,
	type AxiosError,
} from "axios";
import type { ErrorManager } from "./error-strategies/error-manager";
import { strategies } from "./error-strategies";
import type { ErrorContext } from "./error-strategies/types";

// 创建默认错误管理器实例
const createDefaultErrorManager = () => {
	// 动态导入ErrorManager以避免循环依赖
	const { ErrorManager } = require("./error-strategies/error-manager");
	return new ErrorManager(strategies);
};

export interface HttpClientOptions {
	baseURL?: string;
	timeout?: number;
	headers?: Record<string, string>;
	errorManager?: ErrorManager;
	/** 是否将响应状态码作为成功标志，默认true */
	validateStatus?: boolean | ((status: number) => boolean);
	/** 对响应结果进行转换 */
	transformResponse?: <T>(data: T) => T;
	/** 对请求数据进行转换 */
	transformRequest?: <T>(data: T) => T;
	/** 配置携带凭证 */
	withCredentials?: boolean;
	/** 自定义请求拦截器 */
	requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
	/** 自定义响应拦截器 */
	responseInterceptor?: (response: AxiosResponse) => AxiosResponse;
	/** 根据自定义逻辑判断API响应是否成功 */
	isSuccessResponse?: (response: unknown) => boolean;
}

// Request interface result format
export interface RequestResult<T = unknown> {
	success: boolean;
	data?: T;
	error?: boolean;
	message?: string;
	code?: string;
	status?: number;
	originalResponse?: AxiosResponse;
	shouldRetry?: boolean;
	retryDelay?: number;
}

// Custom HTTP method options
export interface CustomRequestConfig
	extends Omit<AxiosRequestConfig, "validateStatus"> {
	_retryCount?: number;
	/** Validate response status */
	validateStatus?: boolean | ((status: number) => boolean);
	/** Transform response data */
	transformResponse?: <T>(data: T) => T;
	/** Transform request data */
	transformRequest?: <T>(data: T) => T;
	/** Configure credentials */
	withCredentials?: boolean;
	/** Custom request interceptor */
	requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
	/** Custom response interceptor */
	responseInterceptor?: (response: AxiosResponse) => AxiosResponse;
	/** Custom logic to determine if API response is successful */
	isSuccessResponse?: (response: unknown) => boolean;
}

export class HttpClient {
	private errorManager!: ErrorManager;
	private options: HttpClientOptions;
	private axiosInstance: AxiosInstance;
	private defaultConfig: CustomRequestConfig;

	constructor(options: HttpClientOptions = {}) {
		this.options = options;

		// 延迟创建错误管理器以避免循环依赖 
		let errorManagerInstance: ErrorManager;
		Object.defineProperty(this, "errorManager", {
			get: () => {
				if (!errorManagerInstance) {
					errorManagerInstance =
						options.errorManager || createDefaultErrorManager();
				}
				return errorManagerInstance;
			},
		});

		this.defaultConfig = {
			baseURL: options.baseURL,
			timeout: options.timeout || 30000,
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {}),
			},
			validateStatus:
				typeof options.validateStatus === "function"
					? options.validateStatus
					: options.validateStatus === false
						? undefined
						: (status) => status >= 200 && status < 300,
			withCredentials: options.withCredentials,
		};

		this.axiosInstance = axios.create(this.defaultConfig as AxiosRequestConfig);
		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// Request interceptor
		this.axiosInstance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// 应用自定义请求转换
				if (this.options.transformRequest && config.data) {
					config.data = this.options.transformRequest(config.data);
				}

				// 应用自定义请求拦截器
				if (this.options.requestInterceptor) {
					// 确保返回类型是InternalAxiosRequestConfig
					return this.options.requestInterceptor(
						config,
					) as InternalAxiosRequestConfig;
				}

				return config;
			},
			(error) => Promise.reject(error),
		);

		// Response interceptor
		this.axiosInstance.interceptors.response.use(
			(response) => {
				// 应用自定义响应转换
				if (this.options.transformResponse) {
					response.data = this.options.transformResponse(response.data);
				}

				// 应用自定义响应拦截器
				if (this.options.responseInterceptor) {
					const newResponse = this.options.responseInterceptor(response);
					return newResponse;
				}

				return response;
			},
			(error) => Promise.reject(error),
		);
	}

	/**
	 * 执行HTTP请求
	 */
	async request<T = unknown>(
		method: string,
		url: string,
		params: Record<string, unknown> = {},
		config: CustomRequestConfig = {},
	): Promise<RequestResult<T>> {
		// 创建请求配置
		const requestConfig: CustomRequestConfig = {
			method: method.toLowerCase() as Method,
			url,
			...config,
		};

		// 根据请求方法设置参数
		if (
			["get", "delete", "head", "options"].includes(requestConfig.method || "")
		) {
			requestConfig.params = params;
		} else {
			requestConfig.data = params;
		}

		try {
			// 执行请求
			const response: AxiosResponse = await this.axiosInstance.request(
				requestConfig as AxiosRequestConfig,
			);

			// 判断API响应是否成功
			let isSuccess = true;

			// 使用自定义判断逻辑
			if (this.options.isSuccessResponse) {
				isSuccess = this.options.isSuccessResponse(response.data);
			}
			// 否则，默认根据HTTP状态码判断
			else if (response.status < 200 || response.status >= 300) {
				isSuccess = false;
			}

			// 成功响应
			return {
				success: isSuccess,
				data: response.data,
				status: response.status,
				originalResponse: response,
				...(isSuccess
					? {}
					: {
							error: true,
							message: this.extractErrorMessage(response.data) || "请求失败",
							code:
								this.extractErrorCode(response.data) ||
								`HTTP_${response.status}`,
						}),
			};
		} catch (error) {
			// 创建错误上下文
			const errorContext: ErrorContext = {
				error: error as Error,
				method: method.toUpperCase(),
				url: this.options.baseURL ? `${this.options.baseURL}${url}` : url,
				params,
				retryCount: config._retryCount,
			};

			// 使用错误管理器处理错误
			const errorResponse = this.errorManager.handleError(errorContext);

			// 如果需要重试
			if (errorResponse.shouldRetry) {
				// 延迟后重试
				if (errorResponse.retryDelay) {
					await new Promise<void>((resolve) =>
						setTimeout(resolve, errorResponse.retryDelay),
					);
				}

				// 递增重试计数，使用类型断言确保TypeScript不会报错
				const newConfig = {
					...config,
					_retryCount: (config._retryCount || 0) + 1,
				} as CustomRequestConfig;

				return this.request<T>(method, url, params, newConfig);
			}

			return {
				...errorResponse,
				status: (error as AxiosError).response?.status,
			} as RequestResult<T>;
		}
	}

	/**
	 * 从响应数据中提取错误消息
	 */
	private extractErrorMessage(data: unknown): string | undefined {
		if (!data) return undefined;

		// 常见API错误格式处理
		if (typeof data === "string") return data;
		if (typeof data === "object" && data !== null) {
			const errorData = data as Record<string, unknown>;
			if (typeof errorData.message === "string") return errorData.message;
			if (typeof errorData.msg === "string") return errorData.msg;
			if (typeof errorData.error === "string") return errorData.error;
			if (typeof errorData.errorMessage === "string")
				return errorData.errorMessage;
			if (typeof errorData.error === "object" && errorData.error !== null) {
				const errorObj = errorData.error as Record<string, unknown>;
				if (typeof errorObj.message === "string") return errorObj.message;
			}
		}

		return undefined;
	}

	/**
	 * 从响应数据中提取错误代码
	 */
	private extractErrorCode(data: unknown): string | undefined {
		if (!data) return undefined;

		// 常见API错误格式处理
		if (typeof data === "object" && data !== null) {
			const errorData = data as Record<string, unknown>;
			if (errorData.code) return String(errorData.code);
			if (errorData.errorCode) return String(errorData.errorCode);
			if (typeof errorData.error === "object" && errorData.error !== null) {
				const errorObj = errorData.error as Record<string, unknown>;
				if (errorObj.code) return String(errorObj.code);
			}
			if (errorData.status) return String(errorData.status);
		}

		return undefined;
	}

	/**
	 * GET请求
	 */
	async get<T = unknown>(
		url: string,
		params?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("get", url, params || {}, config);
	}

	/**
	 * POST请求
	 */
	async post<T = unknown>(
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("post", url, data || {}, config);
	}

	/**
	 * PUT请求
	 */
	async put<T = unknown>(
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("put", url, data || {}, config);
	}

	/**
	 * DELETE请求
	 */
	async delete<T = unknown>(
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("delete", url, data || {}, config);
	}

	/**
	 * PATCH请求
	 */
	async patch<T = unknown>(
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("patch", url, data || {}, config);
	}

	/**
	 * HEAD请求
	 */
	async head<T = unknown>(
		url: string,
		params?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("head", url, params || {}, config);
	}

	/**
	 * OPTIONS请求
	 */
	async optionsRequest<T = unknown>(
		url: string,
		params?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		return this.request<T>("options", url, params || {}, config);
	}

	/**
	 * 通用JSON请求，自动设置Content-Type
	 */
	async jsonRequest<T = unknown>(
		method: string,
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		const jsonConfig = {
			...config,
			headers: {
				"Content-Type": "application/json",
				...config?.headers,
			},
		} as CustomRequestConfig;

		return this.request<T>(method, url, data || {}, jsonConfig);
	}

	/**
	 * 表单请求，使用application/x-www-form-urlencoded
	 */
	async formRequest<T = unknown>(
		method: string,
		url: string,
		data?: Record<string, unknown>,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		const formConfig = {
			...config,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				...config?.headers,
			},
		} as CustomRequestConfig;

		// 转换请求数据为表单格式
		const formData = data
			? new URLSearchParams(data as Record<string, string>).toString()
			: "";

		return this.request<T>(
			method,
			url,
			formData as unknown as Record<string, unknown>,
			formConfig,
		);
	}

	/**
	 * 文件上传请求，使用multipart/form-data
	 */
	async uploadFile<T = unknown>(
		url: string,
		formData: FormData,
		config?: CustomRequestConfig,
	): Promise<RequestResult<T>> {
		const uploadConfig = {
			...config,
			headers: {
				"Content-Type": "multipart/form-data",
				...config?.headers,
			},
		} as CustomRequestConfig;

		return this.request<T>(
			"post",
			url,
			formData as unknown as Record<string, unknown>,
			uploadConfig,
		);
	}
}
