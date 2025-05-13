"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { apiClient } from "@/lib/api-client";

interface FormFieldOption {
	value: unknown;
	label: string;
	disabled?: boolean;
}

interface ValidationRule {
	type?: "required" | "min" | "max" | "pattern" | "custom";
	value?: number | string;
	message: string;
}

interface FormField {
	name: string;
	label: string;
	type:
		| "text"
		| "textarea"
		| "number"
		| "boolean"
		| "select"
		| "radio"
		| "date"
		| "checkbox"
		| "file"
		| "custom";
	placeholder?: string;
	description?: string;
	required?: boolean;
	disabled?: boolean;
	options?: FormFieldOption[];
	defaultValue?: unknown;
	hidden?: boolean;
	rules?: ValidationRule[];
}

interface ApiInfo {
	serviceId: string;
	apiId: string;
	method: string;
	path: string;
	baseUrl?: string;
}

interface FormSchema {
	title: string;
	description?: string;
	fields: FormField[];
	submitText?: string;
	cancelText?: string;
	apiInfo?: ApiInfo;
	onSubmitSuccess?: (result: SubmitResult) => void;
	onSubmitError?: (error: Error | SubmitResult) => void;
}

interface SubmitResult {
	success: boolean;
	message?: string;
	data?: unknown;
	error?: string;
}

export interface FormRendererProps {
	schema: FormSchema;
}

export function FormRenderer({ schema }: FormRendererProps) {
	const [formData, setFormData] = useState<Record<string, unknown>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (
		fieldName: string,
		value: unknown,
		fieldType?: string,
	) => {
		// Clear error for this field
		if (errors[fieldName]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[fieldName];
				return newErrors;
			});
		}

		// Process different field types
		let processedValue = value;
		if (fieldType === "number" && typeof value === "string") {
			processedValue = value === "" ? "" : Number(value);
		} else if (fieldType === "boolean") {
			processedValue = Boolean(value);
		}

		setFormData((prev) => ({
			...prev,
			[fieldName]: processedValue,
		}));
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		let isValid = true;

		// 验证所有字段
		for (const field of schema.fields) {
			// 必填字段验证
			if (
				field.required &&
				(formData[field.name] === undefined ||
					formData[field.name] === null ||
					formData[field.name] === "")
			) {
				newErrors[field.name] = `${field.label} is required`;
				isValid = false;
			}

			// 自定义规则验证
			if (field.rules?.length) {
				for (const rule of field.rules) {
					// 跳过已有错误的字段
					if (newErrors[field.name]) break;

					// 根据规则类型执行不同的验证
					switch (rule.type) {
						case "required":
							if (
								formData[field.name] === undefined ||
								formData[field.name] === null ||
								formData[field.name] === ""
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							}
							break;
						case "min":
							if (
								field.type === "number" &&
								typeof formData[field.name] === "number" &&
								(formData[field.name] as number) < (rule.value as number)
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							} else if (
								(field.type === "text" || field.type === "textarea") &&
								typeof formData[field.name] === "string" &&
								(formData[field.name] as string).length < (rule.value as number)
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							}
							break;
						case "max":
							if (
								field.type === "number" &&
								typeof formData[field.name] === "number" &&
								(formData[field.name] as number) > (rule.value as number)
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							} else if (
								(field.type === "text" || field.type === "textarea") &&
								typeof formData[field.name] === "string" &&
								(formData[field.name] as string).length > (rule.value as number)
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							}
							break;
						case "pattern":
							if (
								typeof formData[field.name] === "string" &&
								formData[field.name] &&
								!new RegExp(rule.value as string).test(
									formData[field.name] as string,
								)
							) {
								newErrors[field.name] = rule.message;
								isValid = false;
							}
							break;
					}
				}
			}
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Form validation
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// If apiInfo is provided, submit the form to the API
			if (schema.apiInfo) {
				const result = await apiClient.submitForm(formData, schema.apiInfo);
				setSubmitResult(result);

				if (result.success) {
					schema.onSubmitSuccess?.(result);
				} else {
					setErrors({
						form: result.error || "Submission failed, please try again",
					});
					schema.onSubmitError?.(result);
				}
			} else {
				// Just for testing or preview, return form data
				const mockResult: SubmitResult = {
					success: true,
					data: formData,
					message: "Form submitted successfully (preview mode)",
				};
				setSubmitResult(mockResult);
				schema.onSubmitSuccess?.(mockResult);
			}
		} catch (error) {
			console.error("Form submission error:", error);
			const errorResult = {
				form: error instanceof Error ? error.message : "Error submitting form",
			};
			setErrors(errorResult);
			schema.onSubmitError?.(error as Error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render form fields
	const renderField = (field: FormField) => {
		const {
			name,
			label,
			type,
			placeholder,
			description,
			required,
			disabled,
			options,
			defaultValue,
			hidden,
		} = field;

		// Don't render if the field is marked as hidden
		if (hidden) return null;

		// Set default value if the field has no value in formData but has a default value
		if (formData[name] === undefined && defaultValue !== undefined) {
			handleInputChange(name, defaultValue, type);
		}

		// Render different form controls based on field type
		switch (type) {
			case "text":
				return (
					<div className="mb-4">
						<Label htmlFor={name} className="block mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</Label>
						<Input
							id={name}
							name={name}
							value={formData[name] !== undefined ? String(formData[name]) : ""}
							onChange={(e) => handleInputChange(name, e.target.value, type)}
							placeholder={placeholder}
							disabled={disabled}
							className={errors[name] ? "border-red-500" : ""}
						/>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);

			case "textarea":
				return (
					<div className="mb-4">
						<Label htmlFor={name} className="block mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</Label>
						<Textarea
							id={name}
							name={name}
							value={formData[name] !== undefined ? String(formData[name]) : ""}
							onChange={(e) => handleInputChange(name, e.target.value, type)}
							placeholder={placeholder}
							disabled={disabled}
							className={errors[name] ? "border-red-500" : ""}
						/>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);

			case "number":
				return (
					<div className="mb-4">
						<Label htmlFor={name} className="block mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</Label>
						<Input
							id={name}
							name={name}
							type="number"
							value={formData[name] !== undefined ? String(formData[name]) : ""}
							onChange={(e) => handleInputChange(name, e.target.value, type)}
							placeholder={placeholder}
							disabled={disabled}
							className={errors[name] ? "border-red-500" : ""}
						/>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);

			case "boolean":
				return (
					<div className="mb-4 flex items-start">
						<Checkbox
							id={name}
							name={name}
							checked={formData[name] === true}
							onCheckedChange={(checked) =>
								handleInputChange(name, checked, type)
							}
							disabled={disabled}
							className="mr-2 mt-1"
						/>
						<div>
							<Label htmlFor={name} className="mb-1 cursor-pointer">
								{label} {required && <span className="text-red-500">*</span>}
							</Label>
							{description && (
								<p className="text-sm text-gray-500 mt-1">{description}</p>
							)}
							{errors[name] && (
								<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
							)}
						</div>
					</div>
				);

			case "select":
				return (
					<div className="mb-4">
						<Label htmlFor={name} className="block mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</Label>
						<Select
							value={String(formData[name] || "")}
							onValueChange={(value) => handleInputChange(name, value, type)}
							disabled={disabled}
						>
							<SelectTrigger
								id={name}
								className={errors[name] ? "border-red-500" : ""}
							>
								<SelectValue
									placeholder={placeholder || `Please select ${label}`}
								/>
							</SelectTrigger>
							<SelectContent>
								{(options as unknown as FormFieldOption[])?.map((option) => (
									<SelectItem
										key={String(option.value)}
										value={String(option.value)}
										disabled={option.disabled}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);

			case "radio":
				return (
					<div className="mb-4">
						<div className="mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</div>
						<RadioGroup
							value={String(formData[name] || "")}
							onValueChange={(value) => handleInputChange(name, value, type)}
							className={errors[name] ? "border-red-500 p-2 rounded" : ""}
							disabled={disabled}
						>
							{(options as unknown as FormFieldOption[])?.map((option) => (
								<div
									key={String(option.value)}
									className="flex items-center space-x-2"
								>
									<RadioGroupItem
										value={String(option.value)}
										id={`${name}-${String(option.value)}`}
										disabled={option.disabled}
									/>
									<Label
										htmlFor={`${name}-${String(option.value)}`}
										className="cursor-pointer"
									>
										{option.label}
									</Label>
								</div>
							))}
						</RadioGroup>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);

			// Add other field types here...

			default:
				// Handle as text field by default
				return (
					<div className="mb-4">
						<Label htmlFor={name} className="block mb-1">
							{label} {required && <span className="text-red-500">*</span>}
						</Label>
						<Input
							id={name}
							name={name}
							value={String(formData[name] || "")}
							onChange={(e) => handleInputChange(name, e.target.value)}
							placeholder={placeholder}
							disabled={disabled}
							className={errors[name] ? "border-red-500" : ""}
						/>
						{description && (
							<p className="text-sm text-gray-500 mt-1">{description}</p>
						)}
						{errors[name] && (
							<p className="text-sm text-red-500 mt-1">{errors[name]}</p>
						)}
					</div>
				);
		}
	};

	return (
		<div className="w-full p-4 border rounded-md bg-white shadow-sm">
			<h2 className="text-xl font-semibold mb-2">{schema.title}</h2>
			{schema.description && (
				<p className="text-gray-600 mb-4">{schema.description}</p>
			)}

			<form onSubmit={handleSubmit}>
				{schema.fields.map((field) => (
					<div key={field.name}>{renderField(field)}</div>
				))}

				{/* Form level error message */}
				{errors.form && (
					<div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md">
						{errors.form}
					</div>
				)}

				{/* Form submit button */}
				<div className="flex justify-end gap-2 mt-6">
					{schema.cancelText && (
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setFormData({});
								setErrors({});
							}}
						>
							{schema.cancelText}
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : schema.submitText || "Submit"}
					</Button>
				</div>

				{/* Submission result display */}
				{submitResult?.success && (
					<div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
						<p className="font-medium">Submission Successful</p>
						<p className="text-sm">{submitResult.message}</p>
					</div>
				)}
			</form>
		</div>
	);
}
