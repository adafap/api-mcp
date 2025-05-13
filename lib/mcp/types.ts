import { z } from "zod";

/**
 * API Request Interface
 */
export interface ApiRequest {
	type: "tool" | "render" | "update" | "event";
	tool?: string;
	params?: Record<string, unknown>;
	userQuery?: string;
	serviceId?: string;
	apiId?: string;
	method?: string;
	path?: string;
	renderType?: string;
	baseUrl?: string;
	component?: UIComponent;
	props?: Record<string, unknown>;
	event?: string;
	handler?: string;
	data?: Record<string, unknown>;
}

/**
 * API Parameter Generation Response
 */
export interface APIParamsResponse {
	// API parameters object
	params: Record<string, unknown>;
	// Parameter generation explanation
	explanation: string;
	// Parameter extraction confidence
	confidence: number;
}

/**
 * Data Location Response
 */
export interface DataLocationResponse {
	// Data body path, like "data.items" or "data"
	dataPath: string;
	// Data type, like "array", "object"
	dataType: string;
	// Whether it's paginated data
	isPaginated: boolean;
	// Pagination information location (if applicable)
	paginationInfo?: {
		totalPath?: string;
		currentPagePath?: string;
		pageSizePath?: string;
	};
	// Data item structure description
	structure: Record<
		string,
		{
			type: string;
			description: string;
			isKey?: boolean;
			format?: string;
		}
	>;
}

/**
 * Component Selection Response
 */
export interface ComponentSelectionResponse {
	// Selected component name
	componentName: string;
	// Component selection reason
	reason: string;
	// Component configuration
	config: Record<string, unknown>;
	// Component state configuration
	stateConfig?: Record<string, unknown>;
	// Data mapping configuration
	dataMapping?: {
		// Data path mapping to component properties
		pathMapping?: Record<string, string>;
		// Data transformation rules
		transformations?: Array<{
			// Field that needs transformation
			field: string;
			// Transformation type, like format, calculate, etc.
			type: string;
			// Transformation configuration
			config: Record<string, unknown>;
		}>;
	};
	// Auxiliary components (if needed)
	auxiliaryComponents?: Array<{
		componentName: string;
		position: "before" | "after" | "wrap";
		config: Record<string, unknown>;
		stateConfig?: Record<string, unknown>;
	}>;
}

/**
 * Render Schema Definition
 */
export interface RenderSchema {
	componentName: string;
	props: Record<string, unknown>;
	state?: Record<string, unknown>;
	children?: RenderSchema[];
}

/**
 * Form Schema Definition
 */
export interface FormSchema {
	title: string;
	description?: string;
	fields: FormField[];
	submitText?: string;
	cancelText?: string;
	layout?: "vertical" | "horizontal" | "inline";
	labelWidth?: string | number;
}

/**
 * Form Field Definition
 */
export interface FormField {
	name: string;
	label: string;
	type:
		| "text"
		| "textarea"
		| "number"
		| "boolean"
		| "date"
		| "select"
		| "radio"
		| "checkbox"
		| "file"
		| "custom";
	defaultValue?: unknown;
	placeholder?: string;
	description?: string;
	required?: boolean;
	disabled?: boolean;
	hidden?: boolean;
	rules?: FormFieldRule[];
	options?: FormFieldOption[];
	props?: Record<string, unknown>;
	customType?: string; // For custom component types
}

/**
 * Form Field Validation Rule
 */
export interface FormFieldRule {
	type?: "required" | "min" | "max" | "pattern" | "custom";
	message: string;
	value?: unknown; // Rule parameter value
	validator?: string; // Custom validator name
}

/**
 * Form Field Option
 */
export interface FormFieldOption {
	label: string;
	value: unknown;
	disabled?: boolean;
}

/**
 * Form Submission Result
 */
export interface FormSubmitResult {
	success: boolean;
	data?: unknown;
	error?: string;
	message?: string;
}

/**
 * Form Processing Result
 */
export interface FormRenderResult {
	success: boolean;
	formSchema?: FormSchema;
	rawData?: unknown;
	error?: string;
}

/**
 * Error Analysis Result
 */
export interface ErrorAnalysisResult {
	success: boolean;
	errorType: string;
	errorMessage: string;
	suggestion: string;
	possibleSolutions: string[];
	isFatal: boolean;
	relatedFields?: string[];
	renderAs?: "message" | "card" | "notification";
	retryStrategy?: {
		shouldRetry: boolean;
		retryParams?: Record<string, unknown>;
		alternatePath?: string;
	};
}

/**
 * Parameter Generator Interface
 */
export interface IParameterGenerator {
	/**
	 * Generate API parameters from natural language
	 * @param naturalLanguage User input in natural language
	 * @param apiInfo API metadata information
	 * @returns Generated parameters object and explanation
	 */
	generateParameters(
		naturalLanguage: string,
		apiInfo: ApiRequest,
	): Promise<APIParamsResponse>;
}

/**
 * Data Analyzer Interface
 */
export interface IDataAnalyzer {
	/**
	 * Analyze API response data structure
	 * @param apiResponse API response data
	 * @returns Data location and structure information
	 */
	analyzeData(apiResponse: unknown): Promise<DataLocationResponse>;
}

/**
 * Component Selector Interface
 */
export interface IComponentSelector {
	/**
	 * Select best component and generate configuration
	 * @param dataInfo Data structure information
	 * @param userQuery Original user query
	 * @returns Component selection and configuration information
	 */
	selectComponent(
		dataInfo: DataLocationResponse,
		userQuery: string,
	): Promise<ComponentSelectionResponse>;
}

/**
 * Schema Builder Interface
 */
export interface ISchemaBuilder {
	/**
	 * Create render schema
	 * @param componentSelection Component selection result
	 * @param apiResponse API response data
	 * @param dataLocation Data location information
	 * @returns Render schema
	 */
	createSchema(
		componentSelection: ComponentSelectionResponse,
		apiResponse: unknown,
		dataLocation: DataLocationResponse,
	): RenderSchema;
}

/**
 * Form Generator Interface
 */
export interface IFormGenerator {
	/**
	 * Generate form schema based on API information and user query
	 * @param apiInfo API information
	 * @param userQuery User query
	 * @returns Form schema
	 */
	generateFormSchema(apiInfo: APIInfo, userQuery: string): Promise<FormSchema>;

	/**
	 * Process form submission
	 * @param formData Form data
	 * @param apiInfo API information
	 * @returns Submission result
	 */
	processFormSubmit(
		formData: Record<string, unknown>,
		apiInfo: APIInfo,
	): Promise<FormSubmitResult>;
}

/**
 * Error Analyzer Interface
 */
export interface IErrorAnalyzer {
	/**
	 * Analyze API error
	 * @param error Error object
	 * @param apiInfo API information
	 * @param params Request parameters
	 * @returns Error analysis result
	 */
	analyzeError(
		error: Error,
		apiInfo: APIInfo,
		params: Record<string, unknown>,
	): Promise<ErrorAnalysisResult>;
}

/**
 * Component Descriptor Interface
 */
export interface ComponentDescriptor {
	// Component name
	name: string;
	// Component available capabilities
	capabilities: string[];
	// Applicable data types
	dataTypes: string[];
	// Configuration template
	configTemplate: Record<string, unknown>;
	// Suitability scoring method
	suitabilityScore?(dataInfo: DataLocationResponse): number;
}

/**
 * AI Service Provider Interface
 */
export interface IAIServiceProvider {
	/**
	 * Generate parameters
	 * @param naturalLanguage Natural language
	 * @param apiInfo API information
	 * @returns Parameter generation response
	 */
	generateParameters(
		naturalLanguage: string,
		apiInfo: ApiRequest,
	): Promise<APIParamsResponse>;

	/**
	 * Analyze data structure
	 * @param apiResponse API response
	 * @param originalQuery Original query
	 * @returns Data location response
	 */
	analyzeDataStructure(
		apiResponse: unknown,
		originalQuery: string,
	): Promise<DataLocationResponse>;

	/**
	 * Select component and configure
	 * @param dataStructure Data structure
	 * @param availableComponents Available components
	 * @param originalQuery Original query
	 * @returns Component selection response
	 */
	selectComponentWithConfig(
		dataStructure: DataLocationResponse,
		availableComponents: ComponentDescriptor[],
		originalQuery: string,
	): Promise<ComponentSelectionResponse>;

	/**
	 * Generate form schema
	 * @param apiInfo API information
	 * @param userQuery User query
	 * @returns Form schema
	 */
	generateFormSchema(apiInfo: APIInfo, userQuery: string): Promise<FormSchema>;

	/**
	 * Analyze error
	 * @param error Error object
	 * @param apiInfo API information
	 * @param params Request parameters
	 * @returns Error analysis result
	 */
	analyzeError(
		error: Error,
		apiInfo: APIInfo,
		params: Record<string, unknown>,
	): Promise<ErrorAnalysisResult>;
}

/**
 * API Information Interface
 */
export interface APIInfo {
	id: string;
	name: string;
	description?: string;
	method: string;
	path: string;
	parameters: Record<
		string,
		{
			type: string;
			description?: string;
			required: boolean;
		}
	>;
}

/**
 * API Executor Interface
 */
export interface IApiExecutor {
	executeApi(request: ApiRequest): Promise<unknown>;
}

export interface Tool {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
	execute: (params: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
}

export interface ParameterDefinition {
	type: string;
	description?: string;
	required?: boolean;
}

export interface ToolExecutionResult {
	success: boolean;
	error?: boolean;
	message?: string;
	data?: unknown;
}

export interface ServerInfo {
	name: string;
	version: string;
	capabilities: {
		tools: boolean;
		resources: boolean;
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	id?: string;
	message?: string;
}

export interface RenderResult {
	success: boolean;
	renderType?: string;
	mermaidCode?: string;
	markdownTable?: string;
	rawData?: unknown;
	error?: boolean;
	errorAnalysis?: unknown;
	preferredDisplay?: "chart" | "table";
}

export interface AIClient {
	languageModel(
		modelId:
			| "chat-model"
			| "chat-model-reasoning"
			| "title-model"
			| "artifact-model",
	): unknown;
	textEmbeddingModel(modelId: string): unknown;
	imageModel(modelId: string): unknown;
	generate(options: {
		system: string;
		prompt: string;
		schema: z.ZodType<unknown>;
	}): Promise<unknown>;
	streamObject<T>(options: {
		model: unknown;
		system: string;
		prompt: string;
		schema: z.ZodType<T>;
	}): Promise<{ objectStream: string }>;
}

export interface ErrorContext {
	error: Error;
	request?: ApiRequest;
	response?: ApiResponse<unknown>;
	retryCount?: number;
}

export interface RenderContext {
	state: Record<string, unknown>;
	props: Record<string, unknown>;
	[key: string]: unknown;
	createChildContext: () => RenderContext;
	getComponent: (type: string) => React.ComponentType | undefined;
	renderComponent: (
		type: string,
		props: Record<string, unknown>,
	) => React.ReactNode;
	getData: (key: string) => unknown;
	setTheme: (theme: string) => void;
	setLocale: (locale: string) => void;
}

export interface Schema {
	state?: Record<string, unknown>;
	methods?: Record<string, unknown>;
	components?: Record<string, unknown>;
}

export interface JSFunction {
	type: "JSFunction";
	value: string;
}

// UI Component interface
export interface UIComponent {
	type: string;
	props: Record<string, unknown>;
	children?: UIComponent[];
}

// Render Options interface
export interface RenderOptions {
	context?: RenderContext;
	baseUrl?: string;
	tools?: Tool[];
	theme?: string;
	locale?: string;
}

export interface MCPServerInfo {
	version: string;
	name: string;
	description?: string;
}

export interface MCPToolParameter {
	type: "string" | "number" | "boolean" | "object" | "array";
	description?: string;
	required?: boolean;
	default?: unknown;
}

export interface MCPTool {
	name: string;
	description?: string;
	parameters?: Record<string, MCPToolParameter>;
	execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPServer {
	getServerInfo: () => MCPServerInfo;
	registerTool: (name: string, tool: MCPTool) => void;
	executeTool: (
		name: string,
		args: Record<string, unknown>,
	) => Promise<unknown>;
	getRegisteredTools: () => Map<string, MCPTool>;
}

export interface MCPError extends Error {
	code?: number;
	details?: unknown;
}

export type MCPToolResult = {
	content?: unknown;
	error?: string;
	mermaidCode?: string;
	markdownTable?: string;
};

export const MCPParameterSchema = z.object({
	type: z.enum(["string", "number", "boolean", "object", "array"]),
	description: z.string().optional(),
	required: z.boolean().optional(),
	default: z.unknown().optional(),
});

export interface DataSource {
	id: string;
	title: string;
	description?: string;
	method: string;
	path: string;
	params?: Record<string, unknown>;
	parameters?: Record<string, unknown>;
	enabled?: boolean;
}
