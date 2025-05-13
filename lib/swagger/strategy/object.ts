import type { IProperty } from "@/types/data-source";
import type { IDTOSchema, IPropertySchema } from "@/types/swagger";
import { DtoStrategy } from "./dto";
import _ from "lodash";
import ResponseHandler from "..";
import { OpenAPIV3 } from "openapi-types";
import { SchemaObject } from "openapi-types/dist/OpenAPI3";

export default class ObjectDtoStrategy extends DtoStrategy {
	handleDto(
		dto: IDTOSchema,
		callBack?: (dto: { [key: string]: IProperty }) => void,
	): { [key: string]: IProperty } {
		// Handle cases where it's not an object type or has no properties
		if (dto.type && dto.type !== "object" && !dto.properties) {
			return {};
		}

		// Get property object, ensure it exists
		const propertyObject = dto.properties || {};

		const properties: { [key: string]: IProperty } = {};
		_.forEach(propertyObject, (value, key) => {
			// Skip if property value is empty
			if (!value) return;

			// Handle references
			let resolvedValue: IPropertySchema = value;
			if (value.$ref) {
				const refSchema = this.handleRef(value.$ref);
				if (refSchema) {
					resolvedValue = { ...refSchema, ..._.omit(value, ["$ref"]) };
				}
			}

			// Create property object
			const property: IProperty = {
				name: key,
				description: resolvedValue?.description || "",
				type: resolvedValue?.type || this.checkType(resolvedValue),
				title: this.extractTitle(resolvedValue, key),
				format: resolvedValue?.format,
				required: dto?.required?.includes(key) || false,
				default: resolvedValue?.default as string | number | boolean | null,
				example: resolvedValue?.example,
				apifox: _.get(resolvedValue, "x-apifox") as Record<string, unknown>,
				ada: _.get(resolvedValue, "ada") as {
					[key: string]: unknown;
					search?: boolean | undefined;
				},
			};

			// Handle nested types
			if (resolvedValue.type === "array" && resolvedValue.items) {
				property.items = new ResponseHandler(this.swagger).converDto2Property(
					resolvedValue.items as IPropertySchema,
				);
				if (_.get(property.ada, "root") && callBack) {
					callBack(property.items as { [key: string]: IProperty });
				}
			} else if (resolvedValue.type === "object" || resolvedValue.properties) {
				// Handle nested objects
				property.items = new ResponseHandler(this.swagger).converDto2Property(
					resolvedValue,
				);
			} else if (
				resolvedValue.allOf ||
				resolvedValue.oneOf ||
				resolvedValue.anyOf
			) {
				// Handle combined types
				property.type = "object";
				property.items = new ResponseHandler(this.swagger).converDto2Property(
					resolvedValue,
				);
			} else if (resolvedValue.enum && Array.isArray(resolvedValue.enum)) {
				// Handle enum types
				property.enum = resolvedValue.enum;
			}

			// Cache result to prevent circular references
			if (value.$ref) {
				this.refCache.set(value.$ref, property);
			}

			properties[key] = property;
		});

		// Handle additional property definitions if they exist
		if (
			dto.additionalProperties &&
			typeof dto.additionalProperties === "object"
		) {
			const additionalSchema = dto.additionalProperties as IPropertySchema;
			if (additionalSchema.type || additionalSchema.$ref) {
				properties.additionalProperties = {
					name: "additionalProperties",
					type: "object",
					description: "Dynamic additional properties",
					items: new ResponseHandler(this.swagger).converDto2Property(
						additionalSchema,
					),
				};
			}
		}

		return properties;
	}
}

export function processObjectSchema(schema: SchemaObject): any {
	// Handle cases where it's not an object type or has no properties
	if (schema.type !== "object" || !schema.properties) {
		return {};
	}

	// Get properties object, ensure it exists
	const properties = schema.properties || {};

	// Process each property
	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(properties)) {
		// Skip if property value is empty
		if (!value) {
			continue;
		}

		// Handle references
		if ("$ref" in value) {
			// Process reference
			result[key] = processRefSchema(value);
			continue;
		}

		// Create property object
		const propertySchema = value as SchemaObject;
		const property: any = {
			type: propertySchema.type,
			description: propertySchema.description,
			required: propertySchema.required || false,
		};

		// Use type casting to ensure default is a valid type
		if ("default" in propertySchema) {
			property.default = propertySchema.default;
		}

		// Add format if specified
		if (propertySchema.format) {
			property.format = propertySchema.format;
		}

		// Handle nested types
		if (propertySchema.type === "array") {
			if (propertySchema.items) {
				property.items = processPropertySchema(
					propertySchema.items as SchemaObject,
				);
			}
		}

		// Handle nested objects
		if (propertySchema.type === "object") {
			if (propertySchema.properties) {
				property.properties = processObjectSchema(propertySchema);
			}
		}

		// Handle combined types
		if (propertySchema.allOf || propertySchema.anyOf || propertySchema.oneOf) {
			property.combined = processCombinedSchema(propertySchema);
		}

		// Handle enum types
		if (propertySchema.enum) {
			property.enum = propertySchema.enum;
		}

		result[key] = property;
	}

	return result;
}
