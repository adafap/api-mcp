import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocSearch } from "@/components/docsearch";

export const metadata: Metadata = {
	title: "API-MCP 文档中心",
	description: "API管理控制平台使用文档与API参考",
	other: {
		"docsearch:language": "zh-CN",
		"docsearch:version": "1.0.0",
	},
};

export default function DocsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-slate-50">
			<header className="sticky top-0 z-40 w-full border-b bg-white">
				<div className="container mx-auto flex h-14 items-center px-4">
					<a href="/" className="flex items-center font-medium">
						<span className="text-xl">API-MCP</span>
					</a>
				</div>
			</header>
			<main className="flex-1 md:grid md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
				<aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r bg-white py-6 pr-2 md:sticky md:block lg:py-8">
					<div className="px-6">
						<div className="mb-6">
							<DocSearch />
						</div>
						<h3 className="font-semibold text-slate-900">文档章节</h3>
						<nav className="mt-6 space-y-1">
							<a
								href="/docs"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								首页
							</a>
							<a
								href="/docs/getting-started"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								开始使用
							</a>
							<a
								href="/docs/mcp-server"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								API-MCP 平台介绍
							</a>
							<a
								href="/docs/api-reference"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								API参考
							</a>
							<a
								href="/docs/swagger"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								API文档
							</a>
							<a
								href="/docs/examples"
								className="block rounded-md px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
							>
								示例
							</a>
						</nav>
						<div className="mt-10 border-t pt-6">
							<div className="flex items-center text-xs text-slate-500">
								<span>由 DocSearch 提供搜索支持</span>
							</div>
						</div>
					</div>
				</aside>
				<div className="DocSearch-content bg-white px-4 pt-8 md:px-8 lg:px-10">
					{children}
				</div>
			</main>
			<footer className="border-t bg-white py-6">
				<div className="container mx-auto px-4 text-center text-sm text-slate-500">
					© {new Date().getFullYear()} API-MCP. 保留所有权利。
				</div>
			</footer>
		</div>
	);
}
