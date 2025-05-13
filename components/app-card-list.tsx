"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	MessageSquare,
	ShoppingCart,
	BarChart,
	FileText,
	Users,
	Settings,
	ArrowRight,
	Activity,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Application interface
interface App {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	swaggerUrl: string;
	enabled: boolean;
	createdAt: string;
}

// Icon mapping
const iconMap = {
	message: <MessageSquare className="h-8 w-8" />,
	cart: <ShoppingCart className="h-8 w-8" />,
	chart: <BarChart className="h-8 w-8" />,
	file: <FileText className="h-8 w-8" />,
	users: <Users className="h-8 w-8" />,
	settings: <Settings className="h-8 w-8" />,
};

export function AppCardList() {
	const [apps, setApps] = useState<App[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [appToDelete, setAppToDelete] = useState<string | null>(null);
	const { toast } = useToast();

	const fetchApps = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			console.log("Starting to fetch app list...");

			// Add timestamp to prevent caching
			const timestamp = new Date().getTime();
			const url = `/api/apps?_=${timestamp}`;
			console.log("Request URL:", url);

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"Cache-Control": "no-cache, no-store",
					Pragma: "no-cache",
				},
			}).catch((networkError) => {
				console.error("Network request failed:", networkError);
				throw new Error(
					"Network connection failed, please check your connection",
				);
			});

			console.log("Response received, status code:", response.status);

			// Check content type
			const contentType = response.headers.get("content-type");
			console.log("Response content type:", contentType);

			if (!contentType || !contentType.includes("application/json")) {
				console.error("Response is not JSON format:", contentType);

				// Get response text for debugging
				const responseText = await response.text();
				console.log(
					"Non-JSON response content:",
					`${responseText.substring(0, 200)}...`,
				);

				throw new Error(
					`Server returned non-JSON response (${contentType || "unknown type"}), server might be experiencing errors`,
				);
			}

			// Get response text
			const responseText = await response.text();
			console.log("Raw response length:", responseText.length);

			if (!responseText) {
				console.error("Server returned empty response");
				throw new Error("Server returned empty response");
			}

			// Try to parse JSON
			let data: {
				apps?: App[];
				error?: string;
			};

			try {
				data = JSON.parse(responseText);
				console.log("Parsed response data:", data);
			} catch (parseError) {
				console.error("Failed to parse JSON:", parseError);

				// Log preview of failed content (first and last parts)
				const previewLength = 100;
				const contentPreview =
					responseText.length > previewLength * 2
						? `${responseText.substring(0, previewLength)}...${responseText.substring(responseText.length - previewLength)}`
						: responseText;

				console.error("Failed content preview:", contentPreview);

				throw new Error(
					`Unable to parse response content, status code: ${response.status}`,
				);
			}

			if (!response.ok) {
				console.error(
					"Request failed, status code:",
					response.status,
					"Error message:",
					data?.error,
				);
				throw new Error(
					data?.error || `Request failed, status code: ${response.status}`,
				);
			}

			// Check if returned data structure matches expectations
			if (!data.apps && !Array.isArray(data.apps)) {
				console.error("Server returned unexpected data structure:", data);
				throw new Error(
					"Server returned unexpected data structure, app list not found",
				);
			}

			console.log(
				"Successfully fetched app list data, app count:",
				data.apps?.length || 0,
			);
			setApps(Array.isArray(data.apps) ? data.apps : []);
			setError(null);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Failed to fetch app list:", error);
			setError(errorMessage);
			toast({
				title: "Failed to fetch app list",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchApps();
	}, [fetchApps]);

	// Add retry functionality
	const handleRetry = () => {
		fetchApps();
	};

	const handleDeleteApp = async (id: string) => {
		try {
			const response = await fetch(`/api/apps/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete app");
			}

			// Update app list
			setApps((prevApps) => prevApps.filter((app) => app.id !== id));

			toast({
				title: "Delete successful",
				description: "App has been successfully deleted",
			});
		} catch (error) {
			console.error("Failed to delete app:", error);
			toast({
				title: "Delete failed",
				description: (error as Error).message,
				variant: "destructive",
			});
		} finally {
			setAppToDelete(null);
		}
	};

	const toggleAppEnabled = async (id: string, currentEnabled: boolean) => {
		try {
			const response = await fetch(`/api/apps/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ enabled: !currentEnabled }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to update app status");
			}

			// Update app list
			setApps((prevApps) =>
				prevApps.map((app) =>
					app.id === id ? { ...app, enabled: !app.enabled } : app,
				),
			);

			toast({
				title: "Update successful",
				description: `App has been ${!currentEnabled ? "enabled" : "disabled"}`,
			});
		} catch (error) {
			console.error("Failed to update app status:", error);
			toast({
				title: "Update failed",
				description: (error as Error).message,
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center h-64 text-center">
				<p className="text-lg mb-4 text-destructive">
					Failed to fetch app list
				</p>
				<p className="text-muted-foreground mb-6">{error}</p>
				<Button onClick={handleRetry}>Retry</Button>
			</div>
		);
	}

	if (apps.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center h-64 text-center">
				<p className="text-lg mb-4">No applications yet</p>
				<p className="text-muted-foreground mb-6">
					Click the "Add App" button to create your first application
				</p>
				<Button variant="outline" onClick={handleRetry} className="mb-4">
					Refresh list
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{apps.map((app) => (
				<Card key={app.id} className={!app.enabled ? "opacity-70" : ""}>
					<CardHeader className="flex flex-row items-start justify-between pb-2">
						<div className="flex flex-col space-y-1">
							<CardTitle className="flex items-center">
								{app.name}
								{!app.enabled && (
									<Badge variant="outline" className="ml-2">
										Disabled
									</Badge>
								)}
							</CardTitle>
							<CardDescription className="line-clamp-1">
								{app.description || "No description"}
							</CardDescription>
						</div>
						<div className="bg-muted rounded-full p-2">
							{app.icon && iconMap[app.icon as keyof typeof iconMap] ? (
								iconMap[app.icon as keyof typeof iconMap]
							) : (
								<Activity className="h-8 w-8" />
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-sm mb-2">
							<span className="font-medium">Swagger URL: </span>
							<span className="text-muted-foreground break-all line-clamp-1">
								{app.swaggerUrl}
							</span>
						</div>
						<div className="text-sm">
							<span className="font-medium">Created at: </span>
							<span className="text-muted-foreground">
								{new Date(app.createdAt).toLocaleString()}
							</span>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button asChild variant="outline">
							<Link href={`/mcp/apps/${app.id}`}>
								View details
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>App actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => toggleAppEnabled(app.id, app.enabled)}
								>
									{app.enabled ? "Disable app" : "Enable app"}
								</DropdownMenuItem>
								<AlertDialog
									open={appToDelete === app.id}
									onOpenChange={(open) => {
										if (!open) setAppToDelete(null);
									}}
								>
									<AlertDialogTrigger asChild>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => setAppToDelete(app.id)}
											onSelect={(e) => e.preventDefault()}
										>
											Delete app
										</DropdownMenuItem>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Confirm app deletion?</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone and will also delete all
												data sources under this app.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												className="bg-destructive"
												onClick={() => handleDeleteApp(app.id)}
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</DropdownMenuContent>
						</DropdownMenu>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
