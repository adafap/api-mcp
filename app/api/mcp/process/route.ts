import { type NextRequest, NextResponse } from "next/server";
import { getAPIMCPServer } from "@/lib/mcp/server";
import { getDataSourcesByAppId } from "@/lib/db/queries";
import { connectToDatabase } from "@/lib/db/helpers/mongodb";
import { initializeMCP } from "@/lib/mcp";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Check for action-based requests
		if (body.action === "register_datasources") {
			return await handleRegisterDataSources(body);
		}

		// Default API request handling
		const { request: apiRequest } = body;

		if (!apiRequest) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing API request parameters",
					message: "Failed to process natural language query",
				},
				{ status: 400 },
			);
		}

		// Ensure request contains required parameters
		if (!apiRequest.userQuery) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing user query parameter",
					message: "Failed to process natural language query",
				},
				{ status: 400 },
			);
		}

		// Get MCP server instance
		const mcpServer = getAPIMCPServer();

		// Process request using handleRequest
		const result = await mcpServer.handleRequest(apiRequest);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Failed to process MCP request:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Error processing request",
				message: "Request processing failed",
			},
			{ status: 500 },
		);
	}
}

/**
 * Handle data source registration for an app
 */
async function handleRegisterDataSources(body: {
	appId?: string;
	[key: string]: unknown;
}) {
	// Validate appId
	if (!body.appId) {
		return NextResponse.json(
			{
				success: false,
				error: "Missing appId parameter",
				message: "Failed to register data sources",
			},
			{ status: 400 },
		);
	}

	try {
		console.log(`Registering data sources for app: ${body.appId}`);
		await connectToDatabase();

		// Step 1: First check if there are any data sources for this app
		const dataSources = await getDataSourcesByAppId({
			appId: body.appId as string,
		});
		console.log(
			`Found ${dataSources.length} data sources for app ${body.appId}`,
		);

		if (dataSources.length === 0) {
			return NextResponse.json({
				success: true,
				message: "No data sources found to register",
				count: 0,
				toolCount: 0,
			});
		}

		// Step 2: Get MCP server instance
		const mcpServer = getAPIMCPServer();
		console.log("Got MCP server instance, now initializing MCP system...");

		// Step 3: Initialize MCP completely
		try {
			await initializeMCP();
			console.log("MCP system fully initialized");
		} catch (initError) {
			console.error("Failed to initialize MCP system:", initError);
			// Continue anyway, we'll try the direct method
		}

		// Step 4: Reload all API tools to include the new app's data sources
		console.log("Loading API tools into MCP server...");
		await mcpServer.loadAPITools();
		console.log("API tools reloaded successfully");

		// Step 5: Verify and log the registered tools
		const allTools = mcpServer.getTools();

		// Find all tools related to the current app (by matching the appId in the description or name)
		const appTools = allTools.filter((tool) => {
			// Check if the tool description contains paths that match data sources from this app
			return dataSources.some(
				(ds) =>
					tool.description.includes(ds.path) ||
					tool.name.includes(body.appId as string),
			);
		});

		console.log(`Total MCP tools registered: ${allTools.length}`);
		console.log(`Tools registered for this app: ${appTools.length}`);

		// Log some example tools
		if (appTools.length > 0) {
			console.log("Example tools registered for this app:");
			for (const tool of appTools.slice(0, Math.min(3, appTools.length))) {
				console.log(`- ${tool.name}: ${tool.description}`);
			}
		}

		return NextResponse.json({
			success: true,
			message: "Data sources registered successfully",
			count: dataSources.length,
			toolCount: appTools.length,
		});
	} catch (error) {
		console.error("Failed to register data sources:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				message: "Failed to register data sources",
			},
			{ status: 500 },
		);
	}
}
