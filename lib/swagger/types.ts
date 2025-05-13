/**
 * Swagger API Types
 * Type definitions for Swagger/OpenAPI document parsing
 */

/**
 * Swagger document interface
 */
export interface ISwagger {
	swagger?: string;
	openapi?: string;
	info?: {
		title?: string;
		description?: string;
		version?: string;
	};
	host?: string;
	basePath?: string;
	schemes?: string[];
	consumes?: string[];
	produces?: string[];
	paths?: Record<string, Record<string, IOperation>>;
	definitions?: Record<string, IDTOSchema>;
	components?: {
		schemas?: Record<string, IDTOSchema>;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

/**
 * DTO Schema interface
 */
export interface IDTOSchema {
	type?: string;
	format?: string;
	properties?: Record<string, IPropertySchema>;
	required?: string[];
	allOf?: IDTOSchema[];
	oneOf?: IDTOSchema[];
	items?: IDTOSchema | { $ref: string };
	$ref?: string;
	[key: string]: unknown;
}

/**
 * Property Schema interface
 */
export interface IPropertySchema {
	type: string;
	format?: string;
	description?: string;
	items?: IPropertySchema | { $ref: string };
	$ref?: string;
	required?: boolean;
	enum?: unknown[];
	default?: unknown;
	[key: string]: unknown;
}

/**
 * Swagger Parameter interface
 */
export interface IParameter {
	name: string;
	in: "query" | "header" | "path" | "body" | "formData";
	description?: string;
	required?: boolean;
	type?: string;
	schema?: IDTOSchema | { $ref: string };
	[key: string]: unknown;
}

/**
 * Swagger Operation interface
 */
export interface IOperation {
	operationId?: string;
	summary?: string;
	description?: string;
	tags?: string[];
	parameters?: IParameter[];
	responses?: Record<
		string,
		{
			description?: string;
			schema?: IDTOSchema | { $ref: string };
			content?: Record<
				string,
				{
					schema?: IDTOSchema | { $ref: string };
				}
			>;
		}
	>;
	requestBody?: {
		description?: string;
		content?: Record<
			string,
			{
				schema?: IDTOSchema | { $ref: string };
			}
		>;
	};
	[key: string]: unknown;
}
