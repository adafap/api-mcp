import { type NextRequest, NextResponse } from "next/server";
import { getAPIMCPServer } from "@/lib/mcp/server";

export async function POST(request: NextRequest) {
	try {
		const { formData, apiInfo } = await request.json();

		if (!formData || !apiInfo) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required parameters",
					message: "Form submission failed",
				},
				{ status: 400 },
			);
		}

		const mcpServer = getAPIMCPServer();
		const result = await mcpServer.handleRequest({
			type: "tool",
			tool: "form-submit",
			params: { formData, apiInfo },
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Form submission request failed:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Error processing form submission",
				message: "Form submission failed",
			},
			{ status: 500 },
		);
	}
}
