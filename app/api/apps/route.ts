import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/helpers/mongodb";
import { AppModel } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import SwaggerParser from "@/lib/swagger/parser";
import { createDataSources, type DataSourceParam } from "@/lib/db/queries";

// GET /api/apps - Get all apps
export async function GET(request: NextRequest) {
	try {
		console.log("GET /api/apps - Fetching all apps");
		await connectToDatabase();

		// Get all apps from database, sort by creation date (newest first)
		const apps = await AppModel.find({}).sort({ createdAt: -1 }).lean().exec();

		console.log(`Successfully retrieved ${apps.length} apps`);
		return NextResponse.json({ apps }, { status: 200 });
	} catch (error) {
		console.error("Error fetching apps:", error);
		return NextResponse.json(
			{ error: "Failed to fetch apps" },
			{ status: 500 },
		);
	}
}

// POST /api/apps - Create a new app
export async function POST(request: NextRequest) {
	try {
		console.log("POST /api/apps - Creating new app");
		await connectToDatabase();

		// Get request body
		const body = await request.json();

		// Validate required fields
		if (!body.name || !body.swaggerUrl) {
			return NextResponse.json(
				{ error: "Name and Swagger URL are required" },
				{ status: 400 },
			);
		}

		// Generate unique ID for the app
		const appId = randomUUID();

		// Create new app
		const newApp = new AppModel({
			id: appId,
			name: body.name,
			description: body.description || null,
			icon: body.icon || null,
			swaggerUrl: body.swaggerUrl,
			enabled: body.enabled !== undefined ? body.enabled : true,
			createdAt: new Date(),
		});

		// Save to database
		await newApp.save();
		console.log("App created successfully:", newApp.id);

		// Parse Swagger and create data sources
		let dataSourceCount = 0;
		try {
			console.log(`Parsing Swagger from URL: ${body.swaggerUrl}`);
			const parser = new SwaggerParser({
				baseUrl: new URL(body.swaggerUrl).origin,
			});

			// Load and parse Swagger document
			const result = await parser.loadFromUrl(body.swaggerUrl);

			if (result.list && result.list.length > 0) {
				const dataSources = result.list.map((ds) => ({
					appId: appId,
					title: ds.config?.title || ds.id || "Unnamed API",
					description: ds.config?.description || "",
					method: ds.config?.method?.toUpperCase() || "GET",
					path: ds.config?.path || "",
					params: ds.config?.params || {},
				}));

				console.log(
					`Saving ${dataSources.length} data sources for app ID: ${appId}`,
				);
				await createDataSources({
					dataSources: dataSources.map((ds) => ({
						...ds,
						params: ds.params as Record<string, DataSourceParam>,
					})),
				});
				dataSourceCount = dataSources.length;
			} else {
				console.log(
					`No data sources found in Swagger document for app ID: ${appId}`,
				);
			}
		} catch (swaggerError) {
			console.error("Error parsing Swagger document:", swaggerError);
			// Continue without failing the app creation
		}

		return NextResponse.json(
			{
				app: newApp.toObject(),
				dataSourceCount,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating app:", error);
		return NextResponse.json(
			{ error: "Failed to create app" },
			{ status: 500 },
		);
	}
}
