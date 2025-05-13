"use client";

import type React from "react";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function AddAppButton() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		icon: "",
		swaggerUrl: "",
		enabled: true,
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleIconChange = (value: string) => {
		setFormData((prev) => ({ ...prev, icon: value }));
	};

	const handleEnabledChange = (checked: boolean) => {
		setFormData((prev) => ({ ...prev, enabled: checked }));
	};

	const registerDataSources = async (appId: string) => {
		try {
			console.log("Registering data sources for app:", appId);

			// Call the MCP process API to register data sources
			const registerResponse = await fetch("/api/mcp/process", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "register_datasources",
					appId: appId,
				}),
			});

			// Get response text first for debugging
			const responseText = await registerResponse.text();
			console.log("Register data sources response:", responseText);

			// Parse the response
			let registerData: { error?: string; count?: number };
			try {
				registerData = JSON.parse(responseText);
			} catch (parseError) {
				console.error("Failed to parse register response:", parseError);
				throw new Error(
					"Invalid response from server when registering data sources",
				);
			}

			if (!registerResponse.ok) {
				throw new Error(
					registerData.error || "Failed to register data sources",
				);
			}

			return registerData.count || 0;
		} catch (error) {
			console.error("Failed to register data sources:", error);

			// Retry once after a short delay
			console.log("Retrying data source registration after delay...");
			await new Promise((resolve) => setTimeout(resolve, 1000));

			try {
				const retryResponse = await fetch("/api/mcp/process", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						action: "register_datasources",
						appId: appId,
					}),
				});

				if (retryResponse.ok) {
					const retryData = await retryResponse.json();
					console.log("Retry successful:", retryData);
					return retryData.count || 0;
				}
			} catch (retryError) {
				console.error("Retry also failed:", retryError);
			}

			// Return 0 instead of throwing to allow app creation to succeed
			return 0;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name || !formData.swaggerUrl) {
			toast({
				title: "Incomplete form",
				description: "App name and Swagger URL are required",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);

		try {
			// Step 1: Create the app
			const response = await fetch("/api/apps", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create app");
			}

			// Step 2: Register data sources for the new app
			let dataSourceCount = 0;
			try {
				dataSourceCount = await registerDataSources(data.app.id);
			} catch (registerError) {
				console.error("Error registering data sources:", registerError);
				// Continue even if registration fails - the app is already created
			}

			toast({
				title: "App created successfully",
				description: `Successfully imported ${dataSourceCount} APIs`,
			});

			// Reset form
			setFormData({
				name: "",
				description: "",
				icon: "",
				swaggerUrl: "",
				enabled: true,
			});

			// Close dialog
			setOpen(false);

			// Refresh page to show new app
			window.location.reload();
		} catch (error) {
			toast({
				title: "Creation failed",
				description: (error as Error).message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					<Plus className="h-4 w-4" />
					<span>Add App</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle>Add New App</DialogTitle>
					<DialogDescription>
						Fill in the information below to add a new app to the management
						list.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">App Name *</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Enter app name"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Enter app description"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="swaggerUrl">Swagger URL *</Label>
							<Input
								id="swaggerUrl"
								name="swaggerUrl"
								value={formData.swaggerUrl}
								onChange={handleChange}
								placeholder="Enter Swagger document URL"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="icon">App Icon</Label>
							<Select value={formData.icon} onValueChange={handleIconChange}>
								<SelectTrigger id="icon">
									<SelectValue placeholder="Select an icon" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="message">Message</SelectItem>
									<SelectItem value="cart">Shopping Cart</SelectItem>
									<SelectItem value="chart">Chart</SelectItem>
									<SelectItem value="file">File</SelectItem>
									<SelectItem value="users">Users</SelectItem>
									<SelectItem value="settings">Settings</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="enabled"
								checked={formData.enabled}
								onCheckedChange={handleEnabledChange}
							/>
							<Label htmlFor="enabled">Enable App</Label>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Adding..." : "Add App"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
