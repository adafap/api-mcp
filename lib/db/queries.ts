import "server-only";
import { randomUUID } from "node:crypto";
import {
	ChatModel as Chat,
	Message,
	AppModel as App,
	DataSourceModel as DataSource,
} from "./schema";
import { connectToDatabase } from "./helpers/mongodb";

export async function saveChat({
	id,
	userId,
	title,
}: {
	id: string;
	userId: string;
	title: string;
}) {
	try {
		await connectToDatabase();
		return await Chat.create({
			id,
			createdAt: new Date(),
			title,
		});
	} catch (error) {
		console.error("Failed to save chat to database", error);
		throw error;
	}
}

export async function deleteChatById({ id }: { id: string }) {
	try {
		await connectToDatabase();
		await Message.deleteMany({ chatId: id });
		return await Chat.deleteOne({ id });
	} catch (error) {
		console.error("Failed to delete chat", error);
		throw error;
	}
}

export async function getChatsByUserId({ id }: { id: string }) {
	try {
		await connectToDatabase();
		// Get all chat records, sorted by creation time in descending order
		return await Chat.find().sort({ createdAt: -1 });
	} catch (error) {
		console.error("Failed to get user chat records", error);
		// Return empty array instead of throwing error when error occurs
		return [];
	}
}

export async function getChatById({ id }: { id: string }) {
	try {
		await connectToDatabase();
		return await Chat.findOne({ id });
	} catch (error) {
		console.error("Failed to get chat details", error);
		throw error;
	}
}

export async function saveMessages({
	messages,
}: {
	messages: Array<{
		id: string;
		chatId: string;
		role: string;
		parts: Array<{
			type: string;
			text?: string;
			imageUrl?: string;
		}>;
		attachments: Array<{
			type: string;
			url: string;
			name: string;
		}>;
		createdAt: Date;
	}>;
}) {
	try {
		await connectToDatabase();
		// Convert plain objects to MongoDB documents
		return await Message.insertMany(messages);
	} catch (error) {
		console.error("Failed to save messages to database", error);
		throw error;
	}
}

export async function getMessagesByChatId({ id }: { id: string }) {
	try {
		await connectToDatabase();
		return await Message.find({ chatId: id }).sort({ createdAt: 1 });
	} catch (error) {
		console.error("Failed to get chat message list", error);
		throw error;
	}
}

export async function getMessageById({ id }: { id: string }) {
	try {
		await connectToDatabase();
		return await Message.findOne({ id });
	} catch (error) {
		console.error("Failed to get message details", error);
		throw error;
	}
}

export async function deleteMessagesByChatIdAfterTimestamp({
	chatId,
	timestamp,
}: {
	chatId: string;
	timestamp: Date;
}) {
	try {
		await connectToDatabase();
		return await Message.deleteMany({
			chatId,
			createdAt: { $gte: timestamp },
		});
	} catch (error) {
		console.error("Failed to delete messages after specified time", error);
		throw error;
	}
}

export async function updateChatVisiblityById({
	chatId,
	visibility,
}: {
	chatId: string;
	visibility: "private" | "public";
}) {
	try {
		await connectToDatabase();
		return await Chat.updateOne({ id: chatId }, { $set: { visibility } });
	} catch (error) {
		console.error("Failed to update chat visibility", error);
		throw error;
	}
}

export async function createApp({
	name,
	description,
	icon,
	swaggerUrl,
	enabled,
	userId,
}: {
	name: string;
	description?: string;
	icon?: string;
	swaggerUrl: string;
	enabled: boolean;
	userId: string;
}) {
	try {
		await connectToDatabase();
		const id = randomUUID();
		const result = await App.create({
			id,
			name,
			description,
			icon,
			swaggerUrl,
			enabled,
		});

		return {
			insertId: result.id,
		};
	} catch (error) {
		console.error("Failed to create application", error);
		throw error;
	}
}

export async function getAppsByUserId({ userId }: { userId?: string }) {
	try {
		console.log(
			`Getting ${userId ? `user [${userId}]'s` : "all"} application list...`,
		);
		// No longer filter by userId, get all applications
		const result = await App.find().sort({ createdAt: -1 });

		console.log(
			`Successfully retrieved ${userId ? `user [${userId}]'s` : "all"} application list, total ${result?.length || 0} records`,
		);
		return result || [];
	} catch (error) {
		console.error("Failed to get application list, detailed error:", error);
		// Add more debug information
		if (error instanceof Error) {
			console.error("Error type:", error.name);
			console.error("Error message:", error.message);
			console.error("Error stack:", error.stack);
		}
		// Return empty array instead of throwing error when error occurs
		return [];
	}
}

export async function getAppById({ id }: { id: string }) {
	try {
		await connectToDatabase();
		return await App.findOne({ id });
	} catch (error) {
		console.error("Failed to get application details", error);
		throw error;
	}
}

interface UpdateAppData {
	name?: string;
	description?: string;
	icon?: string;
	swaggerUrl?: string;
	enabled?: boolean;
}

export interface DataSourceParam {
	type: string;
	description?: string;
	required?: boolean;
}

export async function updateApp({
	id,
	name,
	description,
	icon,
	swaggerUrl,
	enabled,
}: {
	id: string;
	name?: string;
	description?: string;
	icon?: string;
	swaggerUrl?: string;
	enabled?: boolean;
}) {
	try {
		await connectToDatabase();
		const updateData: UpdateAppData = {};
		if (name !== undefined) updateData.name = name;
		if (description !== undefined) updateData.description = description;
		if (icon !== undefined) updateData.icon = icon;
		if (swaggerUrl !== undefined) updateData.swaggerUrl = swaggerUrl;
		if (enabled !== undefined) updateData.enabled = enabled;

		return await App.updateOne({ id }, { $set: updateData });
	} catch (error) {
		console.error("Failed to update application", error);
		throw error;
	}
}

export async function deleteAppById({ id }: { id: string }) {
	try {
		await connectToDatabase();
		// Delete associated data sources first
		await DataSource.deleteMany({ appId: id });
		// Then delete the application
		return await App.deleteOne({ id });
	} catch (error) {
		console.error("Failed to delete application", error);
		throw error;
	}
}

export async function createDataSources({
	dataSources,
}: {
	dataSources: Array<{
		appId: string;
		title: string;
		description?: string | null;
		method?: string | null;
		path?: string | null;
		params?: Record<string, DataSourceParam> | null;
	}>;
}) {
	try {
		await connectToDatabase();
		const datasourcesWithId = dataSources.map((ds) => ({
			...ds,
			id: randomUUID(),
			createdAt: new Date(),
		}));
		return await DataSource.insertMany(datasourcesWithId);
	} catch (error) {
		console.error("Failed to create data sources", error);
		throw error;
	}
}

export async function getDataSourcesByAppId({ appId }: { appId: string }) {
	try {
		await connectToDatabase();
		return await DataSource.find({ appId }).sort({ title: 1 });
	} catch (error) {
		console.error("Failed to get application data source list", error);
		throw error;
	}
}

export async function deleteDataSourcesByAppId({ appId }: { appId: string }) {
	try {
		await connectToDatabase();
		return await DataSource.deleteMany({ appId });
	} catch (error) {
		console.error("Failed to delete application data sources", error);
		throw error;
	}
}
