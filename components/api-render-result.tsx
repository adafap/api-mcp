"use client";

import { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import "./markdown-styles.css"; // Table styles
import "./mermaid-styles.css"; // Mermaid chart styles
import {
	extractLineChartData,
	safeRenderMermaid,
} from "@/lib/utils/mermaid-utils";
import { FormRenderer } from "./form-renderer";
import type { FormField, FormSchema } from "@/lib/mcp/types";

interface ChartData {
	title?: string;
	xAxis?: string;
	yAxis?: string;
	series?: string;
	data: Array<{
		date: string;
		value: string | number;
		trend?: "up" | "down" | "neutral";
	}>;
}

interface RenderResult {
	success?: boolean;
	error?: string;
	rawData?: Record<string, unknown>;
	data?: Record<string, unknown>;
	visualization?: {
		type: "mermaid" | "form" | "table";
		content: string | Record<string, unknown>;
		explanation: string;
	};
	metadata?: {
		source: string;
		method: string;
		path: string;
	};
}

interface VisualizationType {
	type: "mermaid" | "form" | "table";
	content: string | Record<string, unknown>;
	explanation: string;
}

/**
 * Safely initialize mermaid with fallback options
 */
function initializeMermaid() {
	try {
		mermaid.initialize({
			startOnLoad: true,
			theme: "default",
			securityLevel: "loose",
			logLevel: "error",
			themeVariables: {
				// Pie chart colors
				pie1: "#FF6384",
				pie2: "#36A2EB",
				pie3: "#FFCE56",
				pie4: "#4BC0C0",
				pie5: "#9966FF",
				pie6: "#FF9F40",
				pie7: "#8AC926",
				pie8: "#1982C4",
			},
			flowchart: {
				htmlLabels: true,
				curve: "basis",
			},
		});
		return true;
	} catch (error) {
		console.error("Failed to initialize Mermaid:", error);
		return false;
	}
}

/**
 * Render Mermaid diagram with fallback
 */
async function renderMermaidDiagram(
	code: string,
	elementId: string,
): Promise<{ success: boolean; svg?: string; error?: string }> {
	try {
		// Validate mermaid code
		if (!code?.trim()) {
			return { success: false, error: "Empty diagram code" };
		}

		// Try to parse the code first
		try {
			await mermaid.parse(code);
		} catch (parseError) {
			console.error("Invalid Mermaid syntax:", parseError);
			return {
				success: false,
				error: "Invalid diagram syntax",
				svg: `<pre class="text-red-500 p-2">${code}</pre>`,
			};
		}

		// Render the diagram
		const { svg } = await mermaid.render(elementId, code);
		return { success: true, svg };
	} catch (error) {
		console.error("Failed to render Mermaid diagram:", error);
		return {
			success: false,
			error: "Failed to render diagram",
			svg: `<pre class="text-red-500 p-2">${code}</pre>`,
		};
	}
}

// MermaidChart component
const MermaidChart = ({ code }: { code: string }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const renderChart = async () => {
			if (!containerRef.current || !code) return;

			try {
				// Validate code
				await mermaid.parse(code);

				// Render chart
				const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
				containerRef.current.innerHTML = svg;
				setError(null);
			} catch (err) {
				console.error("Mermaid rendering failed:", err);
				setError(err instanceof Error ? err.message : "Failed to render chart");
			}
		};

		renderChart();
	}, [code]);

	if (error) {
		return (
			<div className="error mb-4 p-4 bg-red-50 text-red-600 rounded">
				{error}
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="mermaid-container p-4 bg-white overflow-auto border border-gray-200 rounded shadow-sm flex justify-center"
		/>
	);
};

// MarkdownTable component
const MarkdownTable = ({ markdown }: { markdown: string }) => {
	const renderTable = () => {
		const lines = markdown.trim().split("\n");
		if (lines.length < 2) return null;

		// Extract header cells
		const headerCells = lines[0]
			.trim()
			.split("|")
			.filter(Boolean)
			.map((cell) => cell.trim());

		// Build table
		return (
			<table className="border-collapse w-full">
				<thead>
					<tr>
						{headerCells.map((cell, colIndex) => (
							<th
								key={`header-${colIndex}-${cell}`}
								className="border px-4 py-2 bg-gray-100"
							>
								{cell}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{lines.slice(2).map((line, rowIndex) => {
						const cells = line
							.trim()
							.split("|")
							.filter(Boolean)
							.map((cell) => cell.trim());

						if (cells.length === 0) return null;

						return (
							<tr
								key={`row-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									rowIndex
								}`}
							>
								{cells.map((cell, cellIndex) => (
									<td
										key={`cell-${rowIndex}-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											cellIndex
										}`}
										className="border px-4 py-2"
									>
										{cell}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	};

	return (
		<div className="markdown-table-container">
			<div className="markdown-content">{renderTable()}</div>
		</div>
	);
};

// When we receive a form schema visualization from AI, convert it to proper FormSchema
const convertToFormSchema = (content: Record<string, unknown>): FormSchema => {
	// Add detailed logs
	console.log("Converting form schema:", content);

	// Ensure fields is an array type
	let fields = [];
	if (Array.isArray(content.fields)) {
		fields = content.fields;
	} else if (typeof content.fields === "object" && content.fields !== null) {
		// If fields is an object rather than an array, convert to array
		fields = Object.entries(content.fields as Record<string, unknown>).map(
			([key, value]) => {
				if (typeof value === "object" && value !== null) {
					return {
						name: key,
						...(value as object),
					};
				}
				return {
					name: key,
					label: key,
					type: "text",
					value: value,
				};
			},
		);
	}

	// Define more explicit field types
	interface FormFieldWithExtras {
		name?: string;
		label?: string;
		type?: unknown;
		placeholder?: string;
		description?: string;
		required?: boolean;
		options?: Array<{ value: unknown; label: string }>;
		[key: string]: unknown;
	}

	// Ensure each field has necessary properties
	const processedFields = fields.map((field: FormFieldWithExtras) => {
		// Make sure field has name and label
		if (!field.name) {
			console.warn("Form field missing name attribute", field);
		}

		// Perform field type conversion
		let fieldType = field.type || "text";

		// Normalize field type
		switch (String(fieldType).toLowerCase()) {
			case "string":
				fieldType = "text";
				break;
			case "text_area":
			case "longtext":
				fieldType = "textarea";
				break;
			case "integer":
			case "float":
			case "decimal":
				fieldType = "number";
				break;
			case "bool":
			case "boolean_checkbox":
				fieldType = "boolean";
				break;
			// Preserve other valid types
			case "text":
			case "textarea":
			case "number":
			case "boolean":
			case "select":
			case "radio":
			case "date":
			case "checkbox":
			case "file":
				break;
			default:
				console.warn(
					`Unknown field type: ${fieldType}, defaulting to text type`,
				);
				fieldType = "text";
		}

		// Convert validation rules
		const rules = Array.isArray(field.rules)
			? field.rules
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					.map((rule: any) => {
						if (typeof rule === "object" && rule !== null) {
							return {
								type: rule.type,
								value:
									rule.value !== undefined ? String(rule.value) : undefined,
								message: rule.message || "Validation failed",
							};
						}
						return null;
					})
					.filter(Boolean)
			: undefined;

		return {
			...field,
			name: field.name || `field_${Math.random().toString(36).substring(2, 9)}`,
			label: field.label || field.name || "Field",
			type: fieldType as FormField["type"],
			rules,
		};
	});

	// Build final form schema
	const formSchema = {
		...content,
		// Ensure necessary properties exist
		title: (content.title as string) || "Form",
		description:
			(content.description as string) ||
			"Please fill in the following information",
		fields: processedFields as FormField[],
		submitText: (content.submitText as string) || "Submit",
		cancelText: (content.cancelText as string) || "Cancel",
	};

	console.log("Generated form schema:", formSchema);
	return formSchema;
};

/**
 * Renders Mermaid charts or Markdown tables from API responses
 */
export function ApiRenderResult({
	result,
}: {
	result?: RenderResult;
}) {
	const [mermaidSvg, setMermaidSvg] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [showCode, setShowCode] = useState<boolean>(false); // Whether to show original code
	const [chartData, setChartData] = useState<ChartData | null>(null); // Store extracted chart data

	// Initialize mermaid
	useEffect(() => {
		const initialized = initializeMermaid();
		if (!initialized) {
			setError("Failed to initialize chart library");
		}
	}, []);

	// Get the appropriate visualization data, handling different data nesting scenarios
	const getVisualization = (): VisualizationType | null => {
		if (result?.visualization) {
			return result.visualization as VisualizationType;
		}

		if (result?.data?.visualization) {
			return result.data.visualization as VisualizationType;
		}

		return null;
	};

	const visualization = getVisualization();

	// Debug information
	console.log("ApiRenderResult: Starting render", {
		resultType: typeof result,
		resultValue: result,
		isSuccess: result?.success,
		rawData: result?.data,
		dataStructure: {
			hasVisualization: !!result?.visualization,
			visualizationType: result?.visualization?.type,
			hasNestedData: !!result?.data?.data,
			hasNestedVisualization: !!result?.data?.visualization,
		},
		visualizationFound: !!visualization,
	});

	// Render Mermaid chart when visualization changes
	useEffect(() => {
		// If there's no visualization data or type isn't mermaid, exit
		if (!visualization || visualization.type !== "mermaid") return;

		const mermaidCode = visualization.content as string;
		if (!mermaidCode) return;

		const renderMermaid = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Extract chart data if needed
				if (
					mermaidCode.includes("lineChart") ||
					mermaidCode.includes("xychart-beta")
				) {
					const extractedData = extractLineChartData(mermaidCode);
					setChartData(extractedData as ChartData);
				}

				// Render diagram
				const renderID = `mermaid-${Date.now()}`;
				const renderResult = await renderMermaidDiagram(mermaidCode, renderID);

				if (renderResult.success && renderResult.svg) {
					setMermaidSvg(renderResult.svg);
					setError(null);
				} else {
					setError(renderResult.error || "Failed to render chart");
					if (renderResult.svg) {
						setMermaidSvg(renderResult.svg); // Show code as fallback
					}
				}
			} catch (err) {
				console.error("Failed to process Mermaid diagram:", err);
				setError(
					`Failed to process diagram: ${err instanceof Error ? err.message : String(err)}`,
				);
			} finally {
				setIsLoading(false);
			}
		};

		renderMermaid();
	}, [visualization]);

	// Check if result exists
	if (!result) {
		return (
			<div className="text-gray-500 p-2 border border-gray-300 rounded-md">
				Waiting for data to load...
			</div>
		);
	}

	// Check if request was successful
	if (!result.success) {
		return (
			<div className="text-red-500 p-2 border border-red-300 rounded-md">
				<div>Request failed: {result.error || "Unknown error"}</div>
				{result.rawData && (
					<pre className="text-xs mt-2 bg-gray-100 p-2 overflow-auto max-h-40">
						{JSON.stringify(result.rawData, null, 2)}
					</pre>
				)}
			</div>
		);
	}

	// If no visualization, show raw data
	if (!visualization) {
		console.log("No visualization found, showing raw data");
		return (
			<div className="raw-data-result">
				<pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
					{JSON.stringify(result.data || result, null, 2)}
				</pre>
			</div>
		);
	}

	// If we reach here, we should have a visualization to render
	const { type, content, explanation } = visualization as VisualizationType;

	switch (type) {
		case "mermaid":
			return (
				<div className="mermaid-result">
					<p className="text-sm text-gray-500 mb-4">{explanation}</p>
					<MermaidChart code={content as string} />
				</div>
			);

		case "form":
			console.log("Rendering form type visualization:", content);
			try {
				const convertedFormSchema = convertToFormSchema(
					content as Record<string, unknown>,
				);
				return (
					<div className="form-result">
						<h3 className="text-lg font-medium mb-2">
							{convertedFormSchema.title}
						</h3>
						<p className="text-sm text-gray-500 mb-4">{explanation}</p>
						{/* @ts-ignore - Type mismatch but actual functionality is compatible */}
						<FormRenderer schema={convertedFormSchema} />
					</div>
				);
			} catch (error) {
				console.error("Form rendering error:", error);
				return (
					<div className="form-error text-red-500 p-4 border border-red-300 rounded">
						<p>Failed to render form</p>
						<pre className="text-xs mt-2 bg-gray-100 p-2 overflow-auto">
							{error instanceof Error ? error.message : String(error)}
						</pre>
						<div className="mt-2">
							<h4 className="font-medium">Original data:</h4>
							<pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40">
								{JSON.stringify(content, null, 2)}
							</pre>
						</div>
					</div>
				);
			}

		case "table":
			return (
				<div className="table-result">
					<p className="text-sm text-gray-500 mb-4">{explanation}</p>
					<MarkdownTable markdown={content as string} />
				</div>
			);

		default:
			console.log(`Unsupported visualization type: ${type}`);
			return (
				<div className="raw-data-result">
					<h3 className="text-lg font-medium mb-2">API Response Result</h3>
					<pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
						{JSON.stringify(result.data || result, null, 2)}
					</pre>
				</div>
			);
	}
}
