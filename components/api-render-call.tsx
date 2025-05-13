"use client";

import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

export interface ApiRenderCallProps {
	args?: Record<string, unknown>;
}

/**
 * API Call Component
 * Displays the loading status of API requests
 */
export function ApiRenderCall({ args }: ApiRenderCallProps) {
	return (
		<div className="w-full space-y-3 rounded-md border p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">API Request in Progress</h3>
				<div className="text-sm text-gray-500">Processing...</div>
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
			<div className="text-xs text-gray-500 mt-2">
				The system will automatically generate appropriate visualizations based
				on your original query
			</div>
		</div>
	);
}
