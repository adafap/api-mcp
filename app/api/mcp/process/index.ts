import type { Tool } from "@/lib/mcp/types";

// Data source tools registry
const dataSourceTools: Tool[] = [];

// Register data source tool
export function registerDataSourceTool(tool: Tool) {
	dataSourceTools.push(tool);
}

// Get all registered data source tools
export function getDataSourceTools(): Tool[] {
	return dataSourceTools;
}

// Example data source tool
const exampleTool: Tool = {
	name: "example",
	description: "Example data source tool",
	parameters: {
		query: {
			type: "string",
			description: "Query parameter",
			required: true,
		},
	},
	execute: async (params: Record<string, unknown>) => {
		// Implement specific data source query logic here
		return {
			success: true,
			data: {
				message: "Example data source response",
			},
		};
	},
};

// Register example tool
registerDataSourceTool(exampleTool);
