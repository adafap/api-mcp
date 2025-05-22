export default function DocsHome() {
	return (
		<article className="container mx-auto max-w-3xl pb-16">
			<header className="mb-12 border-b pb-4">
				<h1
					id="documentation-home"
					className="mb-3 text-4xl font-bold text-slate-900"
				>
					API-MCP 文档中心
				</h1>
				<p className="text-lg text-slate-600">
					中小型企业的智能API管理与Swagger集成解决方案
				</p>
			</header>
			<div className="prose prose-slate max-w-none">
				<div className="lead-text mb-8 text-lg text-slate-700">
					欢迎来到 API-MCP
					文档中心。API-MCP是一款专为中小型企业设计的AI驱动API管理工具，支持您轻松导入Swagger文档，通过自然语言问答快速掌握API知识，并提供强大的数据可视化及内容修改能力，大幅提升您的API管理效率。
				</div>

				<div className="grid gap-8 md:grid-cols-2">
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-rocket"
								aria-hidden="true"
							>
								<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
								<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
								<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
								<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
							</svg>
						</div>
						<h2
							id="getting-started"
							className="mb-2 text-xl font-bold text-slate-900"
						>
							入门指南
						</h2>
						<p className="mb-4 text-slate-600">
							快速开始使用 API-MCP
							平台。包括安装步骤、Swagger文档导入教程，以及如何通过自然语言与您的API进行对话。
						</p>
						<a
							href="/docs/getting-started"
							className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							查看入门指南
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>

					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-code-2"
								aria-hidden="true"
							>
								<path d="m18 16 4-4-4-4" />
								<path d="m6 8-4 4 4 4" />
								<path d="m14.5 4-5 16" />
							</svg>
						</div>
						<h2
							id="api-reference"
							className="mb-2 text-xl font-bold text-slate-900"
						>
							API参考
						</h2>
						<p className="mb-4 text-slate-600">
							详细的API文档，包括所有可用的端点、参数和响应格式。了解如何利用API-MCP的接口实现Swagger文档的导入与分析。
						</p>
						<a
							href="/docs/api-reference"
							className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							查看API参考
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>

					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
								<polyline points="7.5 4.21 12 6.81 16.5 4.21" />
								<polyline points="7.5 19.79 7.5 14.6 3 12" />
								<polyline points="21 12 16.5 14.6 16.5 19.79" />
								<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
								<line x1="12" y1="22.08" x2="12" y2="12" />
							</svg>
						</div>
						<h2
							id="mcp-server"
							className="mb-2 text-xl font-bold text-slate-900"
						>
							API-MCP 平台
						</h2>
						<p className="mb-4 text-slate-600">
							探索API-MCP平台的核心功能，包括AI驱动的对话式API查询、交互式数据可视化，以及如何通过自然语言对话修改Swagger文档内容。
						</p>
						<a
							href="/docs/mcp-server"
							className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							了解 API-MCP 平台
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>

					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<line x1="10" y1="9" x2="8" y2="9" />
							</svg>
						</div>
						<h2
							id="swagger-docs"
							className="mb-2 text-xl font-bold text-slate-900"
						>
							Swagger集成
						</h2>
						<p className="mb-4 text-slate-600">
							深入了解如何导入和解析Swagger文档，使用柱状图等可视化工具直观展示API数据，以及通过自然语言对话修改和更新API规范。
						</p>
						<a
							href="/docs/swagger"
							className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							查看Swagger集成
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>

					<div className="rounded-lg border bg-white p-6 shadow-sm md:col-span-2">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-book-open"
								aria-hidden="true"
							>
								<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
								<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
							</svg>
						</div>
						<h2 id="examples" className="mb-2 text-xl font-bold text-slate-900">
							使用示例
						</h2>
						<p className="mb-4 text-slate-600">
							通过实际案例学习如何使用API-MCP进行Swagger文档管理。包括导入示例、问答交互示例、数据可视化案例，以及如何利用AI对话实现API文档内容的快速修改与更新。
						</p>
						<a
							href="/docs/examples"
							className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							查看示例
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>

					<div className="rounded-lg border bg-white p-6 shadow-sm md:col-span-2">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M12 9v6m0 0v.01" />
								<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
							</svg>
						</div>
						<h2
							id="homepage-buttons"
							className="mb-2 text-xl font-bold text-slate-900"
						>
							首页按钮功能
						</h2>
						<p className="mb-4 text-slate-600">
							API-MCP项目首页提供了多个功能按钮，帮助您快速访问和管理您的Swagger文档。以下是主要按钮及其功能：
						</p>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div className="rounded-lg border bg-gray-50 p-3">
								<h3 className="mb-1 text-base font-semibold text-slate-900">
									导入Swagger按钮
								</h3>
								<p className="text-sm text-slate-600">
									位于首页顶部的导入按钮，支持从URL、文件或API导入Swagger文档，点击后会打开导入向导。
								</p>
							</div>
							<div className="rounded-lg border bg-gray-50 p-3">
								<h3 className="mb-1 text-base font-semibold text-slate-900">
									AI问答按钮
								</h3>
								<p className="text-sm text-slate-600">
									中央的对话按钮，启动自然语言交互界面，您可以直接提问关于API的任何问题。
								</p>
							</div>
							<div className="rounded-lg border bg-gray-50 p-3">
								<h3 className="mb-1 text-base font-semibold text-slate-900">
									可视化按钮
								</h3>
								<p className="text-sm text-slate-600">
									柱状图图标按钮，生成API数据的可视化图表，帮助您直观理解API使用情况和数据分布。
								</p>
							</div>
							<div className="rounded-lg border bg-gray-50 p-3">
								<h3 className="mb-1 text-base font-semibold text-slate-900">
									文档修改按钮
								</h3>
								<p className="text-sm text-slate-600">
									编辑图标按钮，允许您通过自然语言指令修改API文档内容，自动记录所有变更并支持版本管理。
								</p>
							</div>
							<div className="rounded-lg border bg-gray-50 p-3">
								<h3 className="mb-1 text-base font-semibold text-slate-900">
									MCP Services按钮
								</h3>
								<p className="text-sm text-slate-600">
									导航栏中的服务入口按钮，点击后展开平台提供的核心服务列表，包括API管理、文档转换、数据分析和系统配置等功能模块，是访问各项服务的统一入口。
								</p>
							</div>
						</div>
						<a
							href="/"
							className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							前往使用首页功能
							<svg
								className="ml-1 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</article>
	);
}
