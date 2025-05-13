import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/helpers/mongodb";
import { AppModel, DataSourceModel } from "@/lib/db/schema";

// GET /api/apps/[id] - Get a specific app
export async function GET(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		// Get ID from context
		const id = context.params.id;

		console.log(`GET /api/apps/${id} - Fetching app`);
		await connectToDatabase();

		// Find app by ID
		const app = await AppModel.findOne({ id }).lean().exec();

		if (!app) {
			return NextResponse.json({ error: "App not found" }, { status: 404 });
		}

		return NextResponse.json({ app }, { status: 200 });
	} catch (error) {
		console.error("Error fetching app:", error);
		return NextResponse.json({ error: "Failed to fetch app" }, { status: 500 });
	}
}

// PATCH /api/apps/[id] - Update a specific app
export async function PATCH(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		// Get ID from context
		const id = context.params.id;

		console.log(`PATCH /api/apps/${id} - Updating app`);
		await connectToDatabase();

		// Get request body
		const body = await request.json();

		// Find app by ID
		const app = await AppModel.findOne({ id });

		if (!app) {
			return NextResponse.json({ error: "App not found" }, { status: 404 });
		}

		// Update fields if provided in request body
		if (body.name !== undefined) app.name = body.name;
		if (body.description !== undefined) app.description = body.description;
		if (body.icon !== undefined) app.icon = body.icon;
		if (body.swaggerUrl !== undefined) app.swaggerUrl = body.swaggerUrl;
		if (body.enabled !== undefined) app.enabled = body.enabled;

		// Save updated app
		await app.save();

		console.log(`App ${id} updated successfully`);
		return NextResponse.json({ app: app.toObject() }, { status: 200 });
	} catch (error) {
		console.error("Error updating app:", error);
		return NextResponse.json(
			{ error: "Failed to update app" },
			{ status: 500 },
		);
	}
}

// DELETE /api/apps/[id] - Delete a specific app
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } },
) {
	try {
		// Get ID from context
		const id = context.params.id;

		console.log(`DELETE /api/apps/${id} - Deleting app`);
		await connectToDatabase();

		// Find app by ID
		const app = await AppModel.findOne({ id });

		if (!app) {
			return NextResponse.json({ error: "App not found" }, { status: 404 });
		}

		// Delete app
		await AppModel.deleteOne({ id });

		// Delete all related data sources
		await DataSourceModel.deleteMany({ appId: id });

		console.log(`App ${id} deleted successfully`);
		return NextResponse.json(
			{ message: "App deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting app:", error);
		return NextResponse.json(
			{ error: "Failed to delete app" },
			{ status: 500 },
		);
	}
}
