import type {
	APIInfo,
	FormSchema,
	FormSubmitResult,
	IFormGenerator,
	AIClient,
	FormField,
	FormFieldOption,
} from "../types";
import { AIProvider, AIProviderAdapter } from "./ai-provider";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import { serverRequest } from "./server-request";

/**
 * Form Generator
 * Responsible for generating form schema and handling form submissions
 */
export class FormGenerator implements IFormGenerator {
	private apiExecutor: (
		url: string,
		method: string,
		data: Record<string, unknown>,
	) => Promise<Record<string, unknown>>;
	private aiProvider: AIClient;
	constructor() {
		const provider = new AIProvider(myProvider, "chat-model");
		this.aiProvider = new AIProviderAdapter(provider);
		this.apiExecutor = this.createApiExecutor();
	}

	/**
	 * Generate form schema based on API information and user query
	 * @param apiInfo API information
	 * @param userQuery User query
	 * @returns Form schema
	 */
	async generateFormSchema(
		apiInfo: APIInfo,
		userQuery: string,
	): Promise<FormSchema> {
		const requestId = `form_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		console.log(
			`[FormGenerator:${requestId}] Starting to generate form schema`,
		);

		// Define Zod schema for form schema generation
		const formSchemaZod = z.object({
			title: z.string().describe("Form title"),
			description: z.string().optional().describe("Form description"),
			fields: z
				.array(
					z.object({
						name: z.string().describe("Field name"),
						label: z.string().describe("Field label"),
						type: z
							.enum([
								"text",
								"textarea",
								"number",
								"boolean",
								"date",
								"select",
								"radio",
								"checkbox",
								"file",
								"custom",
							])
							.describe("Field type"),
						defaultValue: z.unknown().optional().describe("Default value"),
						placeholder: z.string().optional().describe("Placeholder text"),
						description: z.string().optional().describe("Field description"),
						required: z.boolean().optional().describe("Required field"),
						disabled: z.boolean().optional().describe("Disabled field"),
						hidden: z.boolean().optional().describe("Hidden field"),
						rules: z
							.array(
								z.object({
									type: z
										.enum(["required", "min", "max", "pattern", "custom"])
										.optional()
										.describe("Rule type"),
									message: z.string().describe("Error message"),
									value: z.unknown().optional().describe("Rule value"),
									validator: z.string().optional().describe("Custom validator"),
								}),
							)
							.optional()
							.describe("Validation rules"),
						options: z
							.array(
								z.object({
									label: z.string().describe("Option label"),
									value: z.unknown().describe("Option value"),
									disabled: z.boolean().optional().describe("Option disabled"),
								}),
							)
							.optional()
							.describe("Options list for select/radio/checkbox"),
						props: z
							.record(z.unknown())
							.optional()
							.describe("Component properties"),
						customType: z.string().optional().describe("Custom component type"),
					}),
				)
				.describe("Form fields list"),
			submitText: z.string().optional().describe("Submit button text"),
			cancelText: z.string().optional().describe("Cancel button text"),
			layout: z
				.enum(["vertical", "horizontal", "inline"])
				.optional()
				.describe("Form layout"),
			labelWidth: z
				.union([z.string(), z.number()])
				.optional()
				.describe("Label width"),
		});

		// Build system prompt
		const systemPrompt = `You are a professional form design expert. Design the most suitable form schema based on API information and user query.
Task: Analyze API information and user query to create a form schema for collecting user input for API calls.

Form Design Guidelines:
1. Field names must match API parameter names
2. Choose the most appropriate UI control type for each field
3. Add necessary validation rules
4. Provide clear labels and descriptions
5. Organize form layout logically
6. Provide options for selection controls (select/radio/checkbox)
7. Set appropriate default values (if any)

Ensure the form design is intuitive, user-friendly, and meets all API parameter requirements.`;

		// Prepare API parameter information
		const paramInfo = Object.entries(apiInfo.parameters || {})
			.map(([name, param]) => {
				return `- ${name}: Type(${param.type || "string"}), ${param.required ? "Required" : "Optional"}, ${param.description || "No description"}`;
			})
			.join("\n");

		// Build user prompt
		const userPrompt = `Please design a form schema based on the following API information and user query:

API Information:
- Endpoint: ${apiInfo.method.toUpperCase()} ${apiInfo.path}
- Description: ${apiInfo.description || "No description"}
- Parameters:
${paramInfo}

User Query: "${userQuery}"

Please generate a complete form schema, including:
1. Form title and description
2. All necessary form fields
3. Appropriate field validation rules
4. Reasonable UI control type selection
5. Clear labels and hint text

Special note: Field names must match API parameter names!`;

		try {
			// Call AI service to generate form schema
			const schema = (await this.aiProvider.generate({
				system: systemPrompt,
				prompt: userPrompt,
				schema: formSchemaZod,
			})) as z.infer<typeof formSchemaZod>;

			console.log(
				`[FormGenerator:${requestId}] Form schema generated successfully with ${schema.fields.length} fields`,
			);

			// Add default values
			if (!schema.submitText) schema.submitText = "Submit";
			if (!schema.cancelText) schema.cancelText = "Cancel";
			if (!schema.layout) schema.layout = "vertical";

			// Ensure field options conform to FormFieldOption type requirements
			const normalizedSchema = {
				...schema,
				fields: schema.fields.map((field) => {
					if (field.options) {
						return {
							...field,
							options: field.options.map((option) => ({
								...option,
								value: option.value !== undefined ? option.value : null,
							})),
						};
					}
					return field;
				}) as FormField[],
			} as FormSchema;

			return normalizedSchema;
		} catch (error) {
			console.error(
				`[FormGenerator:${requestId}] Failed to generate form schema:`,
				error,
			);
			throw new Error(
				`Failed to generate form schema: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Process form submission
	 * @param formData Form data
	 * @param apiInfo API information
	 * @returns Submission result
	 */
	async processFormSubmit(
		formData: Record<string, unknown>,
		apiInfo: APIInfo,
	): Promise<FormSubmitResult> {
		const submitId = `submit_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
		console.log(
			`[FormGenerator:${submitId}] Starting to process form submission`,
		);

		try {
			// Validate submission data
			this.validateFormData(formData, apiInfo);

			// Build URL
			let url = apiInfo.path;
			const baseUrl = process.env.API_BASE_URL || "http://localhost:3030";

			// Complete URL
			const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

			// Handle path parameters
			const pathParams: Record<string, unknown> = {};
			const regex = /{([^}]+)}/g;
			let match: RegExpExecArray | null;

			// Find path parameters
			match = regex.exec(url);
			while (match !== null) {
				const paramName = match[1];
				if (formData[paramName]) {
					pathParams[paramName] = formData[paramName];
					url = url.replace(
						`{${paramName}}`,
						encodeURIComponent(String(formData[paramName])),
					);
					// Remove processed path parameters from form data
					delete formData[paramName];
				}
				match = regex.exec(url);
			}

			// Execute API call
			console.log(
				`[FormGenerator:${submitId}] Calling API: ${apiInfo.method.toUpperCase()} ${url}`,
			);
			const response = await serverRequest(
				apiInfo.method.toLowerCase(),
				url,
				formData,
			);

			console.log(
				`[FormGenerator:${submitId}] API call successful, response status: ${response.status || "unknown"}`,
			);

			return {
				success: true,
				data: response.data,
				message: "Form submitted successfully",
			};
		} catch (error) {
			console.error(
				`[FormGenerator:${submitId}] Form submission failed:`,
				error,
			);

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				message: "Form submission failed",
			};
		}
	}

	/**
	 * Validate form data
	 * @param formData Form data
	 * @param apiInfo API information
	 * @throws Throws error if validation fails
	 */
	private validateFormData(
		formData: Record<string, unknown>,
		apiInfo: APIInfo,
	): void {
		// Check required parameters
		const missingParams: string[] = [];

		for (const [name, param] of Object.entries(apiInfo.parameters || {})) {
			if (
				param.required &&
				(formData[name] === undefined ||
					formData[name] === null ||
					formData[name] === "")
			) {
				missingParams.push(name);
			}
		}

		if (missingParams.length > 0) {
			throw new Error(
				`Missing required parameters: ${missingParams.join(", ")}`,
			);
		}
	}

	/**
	 * Create API executor
	 */
	private createApiExecutor() {
		return async (
			url: string,
			method: string,
			data: Record<string, unknown>,
		): Promise<Record<string, unknown>> => {
			try {
				// Build complete URL
				const baseUrl = process.env.API_BASE_URL || "http://localhost:3030";
				const fullUrl = url.startsWith("http")
					? url
					: `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

				// Use server-side request to execute API call
				const result = await serverRequest(method, fullUrl, data);
				return result as unknown as Record<string, unknown>;
			} catch (error) {
				console.error("API execution failed:", error);
				throw error;
			}
		};
	}
}
