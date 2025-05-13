import axios from "axios";
import fs from "node:fs/promises";
import _ from "lodash";
import type { ISwagger, IDTOSchema, IPropertySchema } from "@/types/swagger";
import type {
	ICodeResponse,
	IDataSource,
	IDataSourceConfig,
	IDataSourceList,
	IParams,
	IProperty,
} from "@/types/data-source";
import type { DataSourceOptions } from "@alilc/lowcode-datasource-types";

// 导入策略实现
import type { DtoStrategy } from "./strategy/dto";
import ObjectDtoStrategyImpl from "./strategy/object";
import ArrayDtoStrategyImpl from "./strategy/array";
import StringDtoStrategyImpl from "./strategy/string";
import NumberDtoStrategyImpl from "./strategy/number";
import AllOfDtoStrategyImpl from "./strategy/allof";

/**
 * Swagger解析器的配置选项
 */
export interface ISwaggerParserOptions {
	baseUrl?: string;
	requestType?: string;
	handleMissingTags?: boolean;
	generateMockData?: boolean;
	filterByTags?: string[];
}

/**
 * 统一的Swagger解析器
 * 整合了加载、解析、转换和适配功能
 */
export default class SwaggerParser
	implements IDataSourceList<Record<string, unknown>>
{
	list: IDataSource[] = [];
	private options: ISwaggerParserOptions;
	private swagger?: ISwagger;
	private requestType: string;
	private requestUrl = "";
	private dtoStrategyMap: Record<string, typeof DtoStrategy>;
	private hooks: Record<string, Array<(data: unknown) => unknown>>;

	constructor(options: ISwaggerParserOptions = {}) {
		this.options = {
			requestType: "fetch",
			handleMissingTags: true,
			generateMockData: false,
			...options,
		};

		this.requestType = this.options.requestType || "fetch";

		// 注册DTO处理策略
		this.dtoStrategyMap = {
			object: ObjectDtoStrategyImpl,
			array: ArrayDtoStrategyImpl,
			allOf: AllOfDtoStrategyImpl,
			string: StringDtoStrategyImpl,
			number: NumberDtoStrategyImpl,
		};

		// 初始化钩子系统
		this.hooks = {
			beforeParse: [],
			afterPathParse: [],
			afterOperationParse: [],
			beforeOutput: [],
		};
	}

	/**
	 * 注册生命周期钩子
	 */
	registerHook<T>(
		hookName:
			| "beforeParse"
			| "afterPathParse"
			| "afterOperationParse"
			| "beforeOutput",
		callback: (data: T) => T,
	): void {
		if (this.hooks[hookName]) {
			this.hooks[hookName].push(callback as any);
		}
	}

	/**
	 * 从URL加载并解析Swagger文档
	 */
	async loadFromUrl(url: string): Promise<{ list: IDataSource[] }> {
		try {
			console.log(`正在从 ${url} 加载Swagger文档...`);
			const response = await axios.get(url);
			return this.parseDocument(response.data);
		} catch (error) {
			console.error("加载Swagger文档失败:", error);
			throw new Error(`加载Swagger文档失败: ${(error as Error).message}`);
		}
	}

	/**
	 * 从本地文件加载并解析Swagger文档
	 */
	async loadFromFile(filePath: string): Promise<{ list: IDataSource[] }> {
		try {
			const content = await fs.readFile(filePath, "utf-8");
			const swaggerJson = JSON.parse(content);
			return this.parseDocument(swaggerJson);
		} catch (error) {
			throw new Error(`解析Swagger文件失败: ${(error as Error).message}`);
		}
	}

	/**
	 * 导出解析结果到文件
	 */
	async exportToFile(filePath: string): Promise<boolean> {
		try {
			await fs.writeFile(
				filePath,
				JSON.stringify({ list: this.list }, null, 2),
				"utf-8",
			);
			return true;
		} catch (error) {
			throw new Error(`导出文件失败: ${(error as Error).message}`);
		}
	}

	/**
	 * 解析Swagger文档并生成数据源列表
	 */
	parseDocument(swaggerDoc: ISwagger): { list: IDataSource[] } {
		try {
			this.swagger = swaggerDoc;

			// 调用beforeParse钩子
			let processedSwagger = swaggerDoc;
			for (const hook of this.hooks.beforeParse) {
				processedSwagger = hook(processedSwagger);
			}

			// 如果需要处理缺少标签的情况
			if (this.options.handleMissingTags) {
				processedSwagger = this.handleMissingTags(processedSwagger);
			}

			// 确定请求URL
			this.requestUrl = this.determineRequestUrl(processedSwagger);

			// 生成数据源列表
			this.list = this.generateDataSources(processedSwagger);

			// 调用beforeOutput钩子
			let result = { list: this.list };
			for (const hook of this.hooks.beforeOutput) {
				result = hook(result);
			}

			console.log(`解析完成, 找到 ${result.list.length} 个API`);
			return result;
		} catch (error) {
			console.error("解析Swagger文档失败:", error);
			throw new Error(`解析Swagger文档失败: ${(error as Error).message}`);
		}
	}

	/**
	 * 生成数据源列表
	 */
	private generateDataSources(swagger: ISwagger): IDataSource[] {
		if (!swagger || !swagger.paths) {
			return [];
		}

		const dataSourceArr: IDataSource[] = [];
		const isOpenApi3 = swagger.openapi?.startsWith("3");

		/** 从path开始遍历，并产生IDataSourceConfig */
		_.forEach(swagger.paths, (pathValue, pathKey) => {
			// 调用afterPathParse钩子
			let processedPathData: [string, any] = [pathKey, pathValue];
			for (const hook of this.hooks.afterPathParse) {
				processedPathData = hook(processedPathData);
			}

			const [processedPathKey, processedPathValue] = processedPathData;

			_.forEach(processedPathValue, (operatValue, operatKey) => {
				// 跳过非HTTP方法的属性
				if (!this.isHttpMethod(operatKey)) {
					return;
				}

				if (!operatValue) return;

				// 调用afterOperationParse钩子
				let processedOperation = operatValue;
				for (const hook of this.hooks.afterOperationParse) {
					processedOperation = hook(processedOperation);
				}

				// 标签过滤
				if (
					this.options.filterByTags &&
					this.options.filterByTags.length > 0 &&
					(!processedOperation.tags ||
						!_.intersection(processedOperation.tags, this.options.filterByTags)
							.length)
				) {
					return;
				}

				/** 创建一个数据源对象 */
				const dataSource: IDataSource = {
					isInit: false,
					type: this.requestType,
				};

				// 优先使用operationId，其次是summary，最后是方法+路径的组合
				dataSource.id =
					processedOperation.operationId ||
					processedOperation.summary ||
					`${operatKey}_${processedPathKey.replace(/[^\w]/g, "_")}`;

				/** 创建一个数据源配置项目,并给默认值 */
				const dataSourceOptions: DataSourceOptions = {
					isCors: true,
					timeout: 5000,
					method: operatKey,
					uri: this.getFullUri(processedPathKey),
					headers: {},
				};

				const dataSourceConfig: IDataSourceConfig = {
					path: processedPathKey,
					method: operatKey,
					tags: processedOperation.tags || [],
					title: processedOperation.summary || dataSource.id,
					subTitle: processedOperation.description || "",
					description: processedOperation.description || "",
					params: {
						query: {},
						path: {},
						body: { items: {} },
					},
				};

				const params: IParams = {};
				const responses: ICodeResponse[] = [];

				let dtoCallback:
					| ((dto: { [key: string]: IProperty }) => void)
					| undefined;

				if (
					this.requestType === "graphql" &&
					dataSourceOptions.method?.toLowerCase() === "get"
				) {
					dtoCallback = (dto: { [key: string]: IProperty }) => {
						_.set(dataSourceOptions, "query", dto);
						_.set(dataSourceOptions, "id", dataSource.id);
					};
				}

				/** 处理 response */
				this.processResponses(processedOperation, responses, dtoCallback);

				/** 处理 parameters */
				this.processParameters(
					processedOperation,
					dataSourceConfig,
					dataSourceOptions,
				);

				/** 处理 requestBody */
				this.processRequestBody(isOpenApi3, processedOperation, params);

				_.set(dataSourceConfig, "params.body.items", params);
				dataSourceConfig.response = responses;
				dataSource.config = dataSourceConfig;
				dataSource.options = dataSourceOptions;

				dataSourceArr.push(dataSource);
			});
		});

		return dataSourceArr;
	}

	/**
	 * 处理响应对象
	 */
	private processResponses(
		operation: any,
		responses: ICodeResponse[],
		dtoCallback?: (dto: { [key: string]: IProperty }) => void,
	): void {
		if (!operation.responses || !this.swagger) return;

		const isOpenApi3 = this.swagger.openapi?.startsWith("3");

		// 处理OpenAPI 3.x格式的响应
		if (isOpenApi3) {
			_.forEach(operation.responses, (res, resKey) => {
				const response: ICodeResponse = {
					code: resKey,
					title: res.description,
				};

				if (res.content) {
					_.forEach(res.content, (value) => {
						if (value.schema) {
							response.properties = this.converDto2Property(
								value.schema,
								dtoCallback,
							);
						}
					});
				} else if (res.schema) {
					// 兼容Swagger 2.0
					response.properties = this.converDto2Property(
						res.schema,
						dtoCallback,
					);
				}

				responses.push(response);
			});
		} else {
			// 处理Swagger 2.0格式的响应
			_.forEach(operation.responses, (res, resKey) => {
				const response: ICodeResponse = {
					code: resKey,
					title: res.description,
				};

				if (res.schema) {
					response.properties = this.converDto2Property(
						res.schema,
						dtoCallback,
					);
				}

				responses.push(response);
			});
		}
	}

	/**
	 * 处理参数对象
	 */
	private processParameters(
		operation: any,
		dataSourceConfig: IDataSourceConfig,
		dataSourceOptions: DataSourceOptions,
	): void {
		if (!operation.parameters) return;

		for (const parameter of operation.parameters) {
			const {
				in: paramIn,
				name,
				description,
				required,
				schema,
				type,
			} = parameter;

			// 处理参数，优先使用schema（OpenAPI 3），否则直接使用参数类型（Swagger 2）
			const paramSchema = schema || { type: type || "string" };

			switch (paramIn) {
				case "query":
					{
						_.set(dataSourceConfig, `params.query.${name}`, {
							description: description,
							name: name,
							type: paramSchema.type,
							required,
							format: paramSchema.format,
						});
					}
					break;
				case "path":
					{
						_.set(dataSourceConfig, `params.path.${name}`, {
							description: description,
							name: name,
							type: paramSchema.type,
							required: true, // 路径参数总是必需的
							format: paramSchema.format,
						});
					}
					break;
				case "header":
					{
						// 处理头部参数
						if (!dataSourceOptions.headers) {
							dataSourceOptions.headers = {};
						}
						// 添加到dataSourceOptions.headers的默认值
						dataSourceOptions.headers[name] = "";
					}
					break;
				default:
					break;
			}
		}
	}

	/**
	 * 处理请求体
	 */
	private processRequestBody(
		isOpenApi3: boolean,
		operation: any,
		params: IParams,
	): void {
		if (!this.swagger) return;

		// 处理OpenAPI 3.x的requestBody
		if (isOpenApi3 && operation.requestBody && operation.requestBody.content) {
			let processed = false;

			// 优先处理application/json
			if (operation.requestBody.content["application/json"]) {
				const schema = operation.requestBody.content["application/json"].schema;
				if (schema) {
					params.properties = this.converDto2Property(schema);
					params.required = schema.required || [];
					processed = true;
				}
			}

			// 如果没有application/json，尝试处理第一个可用的content type
			if (!processed) {
				const firstContentType = Object.keys(operation.requestBody.content)[0];
				if (firstContentType) {
					const schema = operation.requestBody.content[firstContentType].schema;
					if (schema) {
						params.properties = this.converDto2Property(schema);
						params.required = schema.required || [];
					}
				}
			}
		}
		// 处理Swagger 2.0的请求体参数
		else if (!isOpenApi3) {
			// 查找请求体参数
			const bodyParam = operation.parameters?.find((p: any) => p.in === "body");
			if (bodyParam?.schema) {
				params.properties = this.converDto2Property(bodyParam.schema);
				params.required = bodyParam.schema.required || [];
			}
		}
	}

	/**
	 * 获取完整的请求URI
	 */
	private getFullUri(pathKey: string): string {
		if (!this.requestUrl) return pathKey;

		// 确保基础URL和路径连接正确
		const baseUrl = this.requestUrl.endsWith("/")
			? this.requestUrl.slice(0, -1)
			: this.requestUrl;

		const path = pathKey.startsWith("/") ? pathKey : `/${pathKey}`;

		return `${baseUrl}${path}`;
	}

	/**
	 * 确定请求URL
	 */
	private determineRequestUrl(swagger: ISwagger): string {
		// 优先使用配置中的baseUrl
		if (this.options.baseUrl) {
			return this.options.baseUrl;
		}

		// 尝试从servers数组获取
		if (swagger.servers && swagger.servers.length > 0) {
			return swagger.servers[0].url;
		}

		// 如果是Swagger 2.0，尝试从basePath获取
		if (swagger.basePath) {
			return swagger.basePath;
		}

		// 默认返回空字符串
		return "";
	}

	/**
	 * 处理缺少标签的情况
	 * 根据路径或操作ID生成合理的标签
	 */
	private handleMissingTags(swagger: ISwagger): ISwagger {
		if (!swagger || !swagger.paths) return swagger;

		// 创建一个新的对象，避免修改原始对象
		const updatedSwagger = _.cloneDeep(swagger);

		// 确保tags数组存在
		if (!updatedSwagger.tags) {
			updatedSwagger.tags = [];
		}

		const existingTagNames = new Set(
			updatedSwagger.tags.map((tag) => tag.name),
		);
		const generatedTags = new Set<string>();

		// 遍历所有路径和操作
		for (const [path, pathItem] of Object.entries(updatedSwagger.paths)) {
			for (const [method, operation] of Object.entries(pathItem)) {
				if (!operation) continue;
				if (!this.isHttpMethod(method)) continue;

				// 如果操作没有标签，生成一个
				if (!operation.tags || operation.tags.length === 0) {
					const generatedTag = this.generateTagFromPath(path, operation);

					if (
						generatedTag &&
						!existingTagNames.has(generatedTag) &&
						!generatedTags.has(generatedTag)
					) {
						// 添加到Swagger的tags列表
						updatedSwagger.tags.push({ name: generatedTag });
						existingTagNames.add(generatedTag);
						generatedTags.add(generatedTag);
					}

					// 添加生成的标签到操作
					if (generatedTag) {
						operation.tags = [generatedTag];
					}
				}
			}
		}

		return updatedSwagger;
	}

	/**
	 * 检查是否为HTTP方法
	 */
	private isHttpMethod(method: string): boolean {
		return [
			"get",
			"post",
			"put",
			"delete",
			"patch",
			"options",
			"head",
		].includes(method.toLowerCase());
	}

	/**
	 * 从路径或操作ID生成标签名称
	 */
	private generateTagFromPath(path: string, operation: any): string {
		// 尝试从操作ID生成
		if (operation.operationId) {
			const parts = operation.operationId.split(/[_.-]/);
			if (parts.length > 1) {
				return parts[0];
			}
		}

		// 从路径生成
		const pathParts = path.split("/").filter(Boolean);
		if (pathParts.length > 0) {
			// 使用第一个非参数的路径段
			for (const part of pathParts) {
				if (!part.includes("{") && !part.includes("}")) {
					return part;
				}
			}
			// 如果所有段都是参数，使用第一个段
			return pathParts[0].replace(/[{}]/g, "");
		}

		// 如果无法从路径生成，使用通用标签
		return "api";
	}

	/**
	 * DTO转换为Property
	 */
	converDto2Property(
		dto: IDTOSchema | { $ref: string } | IPropertySchema,
		callBack?: (dto: { [key: string]: IProperty }) => void,
	): {
		[key: string]: IProperty;
	} {
		if (!this.swagger) {
			return {};
		}

		let strategy: DtoStrategy;
		let cDto: IDTOSchema;

		if (_.get(dto, "$ref")) {
			cDto = this._handleRef(
				_.get(dto, "$ref") as unknown as string,
			) as IDTOSchema;
		} else {
			cDto = dto as IDTOSchema;
		}

		if (cDto?.type) {
			strategy = this.getDtoStrategy(cDto);
		} else {
			if (_.get(cDto, "allOf") || _.get(cDto, "oneOf")) {
				strategy = new AllOfDtoStrategyImpl(this.swagger);
			} else {
				strategy = new AllOfDtoStrategyImpl(this.swagger);
			}
		}

		return strategy.handleDto(cDto as IDTOSchema, callBack);
	}

	/**
	 * 获取DTO策略
	 */
	getDtoStrategy(dto: IDTOSchema): DtoStrategy {
		if (!this.swagger) {
			return new ObjectDtoStrategyImpl({} as ISwagger);
		}

		const { type } = dto;
		if (type) {
			const StrategyClass = this.dtoStrategyMap[type];
			if (StrategyClass) {
				return new StrategyClass(this.swagger);
			} else {
				return new ObjectDtoStrategyImpl(this.swagger);
			}
		}
		return new ObjectDtoStrategyImpl(this.swagger);
	}

	/**
	 * 处理引用
	 */
	private _handleRef(ref: string): IDTOSchema | undefined {
		const dto: IDTOSchema | undefined = this._getDtoByRef(ref);
		if (dto) {
			return dto;
		}
		return undefined;
	}

	/**
	 * 通过引用获取DTO
	 */
	private _getDtoByRef(ref?: string): IDTOSchema | undefined {
		if (!this.swagger || !ref) {
			return undefined;
		}

		const dtoPath = this._convertStringToFormat(ref);
		if (dtoPath) {
			return _.get(this.swagger, dtoPath);
		}
		return undefined;
	}

	/**
	 * 转换引用字符串格式
	 */
	private _convertStringToFormat(str: string): string {
		const parts = str.split("/");
		const formattedParts = parts
			.slice(1)
			.map((part) => part.replace(/([A-Z])/g, "$1"))
			.join(".");
		return formattedParts;
	}
}
