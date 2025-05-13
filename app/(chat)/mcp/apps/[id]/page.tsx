"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

// 应用接口
interface App {
	id: string;
	name: string;
	description: string | null;
	icon: string | null;
	swaggerUrl: string;
	enabled: boolean;
	createdAt: string;
}

// 数据源接口
interface DataSource {
	id: string;
	appId: string;
	title: string;
	description: string | null;
	method: string | null;
	path: string | null;
	params: Record<string, unknown>;
	createdAt: string;
}

export default function AppDetailPage() {
	const params = useParams();
	const { toast } = useToast();
	const [app, setApp] = useState<App | null>(null);
	const [dataSources, setDataSources] = useState<DataSource[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAppDetails = async () => {
			try {
				const response = await fetch(`/api/apps/${params.id}`);

				if (!response.ok) {
					throw new Error("Failed to fetch app details");
				}

				const data = await response.json();
				setApp(data.app);
				setDataSources(data.dataSources || []);
			} catch (error) {
				console.error("Failed to fetch app details:", error);
				toast({
					title: "Failed to fetch app details",
					description: (error as Error).message,
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchAppDetails();
		}
	}, [params.id, toast]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Skeleton className="h-12 w-48 mb-4" />
				<Skeleton className="h-6 w-full max-w-2xl mb-8" />

				<Tabs defaultValue="info" className="w-full">
					<TabsList>
						<Skeleton className="h-10 w-20 mx-1" />
						<Skeleton className="h-10 w-20 mx-1" />
					</TabsList>
					<div className="mt-6">
						<Skeleton className="h-32 w-full mb-4" />
						<Skeleton className="h-32 w-full mb-4" />
					</div>
				</Tabs>
			</div>
		);
	}

	if (!app) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold mb-4">
						App does not exist or access denied
					</h2>
					<Button asChild variant="outline">
						<a href="/mcp">Return to app list</a>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center gap-4 mb-6">
				<div className="bg-muted rounded-full p-3">
					<Activity className="h-8 w-8" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-semibold">{app.name}</h1>
						{!app.enabled && <Badge variant="outline">已禁用</Badge>}
					</div>
					<p className="text-muted-foreground">{app.description}</p>
				</div>
			</div>

			<Tabs defaultValue="info" className="w-full">
				<TabsList>
					<TabsTrigger value="info">基本信息</TabsTrigger>
					<TabsTrigger value="api">API列表 ({dataSources.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="info" className="space-y-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle>应用信息</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-medium mb-1">Swagger URL</h3>
								<p className="text-sm break-all">{app.swaggerUrl}</p>
							</div>
							<div>
								<h3 className="font-medium mb-1">创建时间</h3>
								<p className="text-sm">
									{new Date(app.createdAt).toLocaleString("zh-CN")}
								</p>
							</div>
							<div>
								<h3 className="font-medium mb-1">状态</h3>
								<p className="text-sm">{app.enabled ? "已启用" : "已禁用"}</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="api" className="space-y-4 mt-6">
					{dataSources.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<p>没有找到API</p>
							</CardContent>
						</Card>
					) : (
						dataSources.map((dataSource) => (
							<Card key={dataSource.id}>
								<CardHeader>
									<CardTitle className="flex items-center text-base">
										<Badge
											className="mr-2"
											variant={getBadgeVariant(dataSource.method || "")}
										>
											{dataSource.method || "ANY"}
										</Badge>
										{dataSource.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-sm mb-2">
										<span className="font-medium mr-2">路径:</span>
										<code className="bg-muted px-1 py-0.5 rounded text-sm">
											{dataSource.path || "/"}
										</code>
									</div>
									{dataSource.description && (
										<div className="text-sm mb-2">
											<span className="font-medium">描述:</span>{" "}
											{dataSource.description}
										</div>
									)}
								</CardContent>
							</Card>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

// 根据HTTP方法返回不同的徽章样式
function getBadgeVariant(
	method: string,
): "default" | "secondary" | "destructive" | "outline" {
	const methodMap: Record<
		string,
		"default" | "secondary" | "destructive" | "outline"
	> = {
		GET: "default",
		POST: "secondary",
		PUT: "outline",
		DELETE: "destructive",
	};

	return methodMap[method.toUpperCase()] || "outline";
}
