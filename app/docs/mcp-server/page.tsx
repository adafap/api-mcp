export default function MCPServer() {
	return (
		<article className="container mx-auto max-w-3xl pb-16">
			<header className="mb-10 border-b pb-4">
				<h1 id="mcp-server" className="mb-3 text-4xl font-bold text-slate-900">
					API-MCP 平台
				</h1>
				<p className="text-lg text-slate-600">
					为中小型企业打造的智能API与Swagger管理系统
				</p>
			</header>

			<div className="prose prose-slate max-w-none">
				<div className="lead-text mb-8 text-lg text-slate-700">
					API-MCP是一款专为中小型企业设计的智能API管理平台，通过AI技术简化Swagger文档的理解与管理，支持自然语言交互、直观数据可视化和智能内容修改，帮助技术和非技术人员更高效地使用和管理API资源。
				</div>

				<h2
					id="architecture"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					系统架构
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP采用模块化架构设计，通过以下组件提供全面的API管理体验：
				</p>

				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3
							id="swagger-import"
							className="mb-2 text-lg font-semibold text-slate-900"
						>
							Swagger导入引擎
						</h3>
						<p className="text-slate-600">
							支持从URL、文件或API导入Swagger文档，自动解析API结构、参数和响应格式，构建智能索引以支持后续查询。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3
							id="ui-renderer"
							className="mb-2 text-lg font-semibold text-slate-900"
						>
							可视化渲染器
						</h3>
						<p className="text-slate-600">
							将API数据转换为柱状图、饼图、关系图等可视化形式，使复杂API信息一目了然，帮助业务人员快速理解API数据。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3
							id="nlp-engine"
							className="mb-2 text-lg font-semibold text-slate-900"
						>
							自然语言处理引擎
						</h3>
						<p className="text-slate-600">
							处理用户的自然语言问题和命令，智能识别意图，实现与API文档的对话式交互，包括查询信息和修改内容。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3
							id="content-manager"
							className="mb-2 text-lg font-semibold text-slate-900"
						>
							内容管理系统
						</h3>
						<p className="text-slate-600">
							管理API文档的变更历史，支持通过自然语言指令修改API定义，并提供版本控制和变更审核功能。
						</p>
					</div>
				</div>

				<h2
					id="features"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					核心功能
				</h2>

				<ul className="mt-6 space-y-4">
					<li className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-2 mt-1 h-5 w-5 shrink-0 text-emerald-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div>
							<span className="font-medium text-slate-900">
								Swagger文档导入
							</span>
							<p className="mt-1 text-slate-700">
								支持多种格式的Swagger文档导入，自动解析API结构，为后续的智能查询和可视化分析奠定基础。
							</p>
						</div>
					</li>
					<li className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-2 mt-1 h-5 w-5 shrink-0 text-emerald-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div>
							<span className="font-medium text-slate-900">自然语言问答</span>
							<p className="mt-1 text-slate-700">
								使用日常语言提问，获取API细节、用例和最佳实践，无需深入研读技术文档，降低API使用的学习曲线。
							</p>
						</div>
					</li>
					<li className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-2 mt-1 h-5 w-5 shrink-0 text-emerald-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div>
							<span className="font-medium text-slate-900">
								柱状图与数据可视化
							</span>
							<p className="mt-1 text-slate-700">
								将API响应数据自动转换为柱状图、线图和饼图等可视化形式，帮助用户快速理解数据分布和趋势，提升决策效率。
							</p>
						</div>
					</li>
					<li className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-2 mt-1 h-5 w-5 shrink-0 text-emerald-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div>
							<span className="font-medium text-slate-900">对话式内容修改</span>
							<p className="mt-1 text-slate-700">
								通过自然语言指令修改API定义和文档内容，如"添加电子邮件验证字段"或"修改分页默认值"，大幅简化API维护工作。
							</p>
						</div>
					</li>
					<li className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-2 mt-1 h-5 w-5 shrink-0 text-emerald-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div>
							<span className="font-medium text-slate-900">版本管理与审计</span>
							<p className="mt-1 text-slate-700">
								全面记录API文档的所有变更，支持版本回滚和比较，确保API开发过程的可追溯性和合规性。
							</p>
						</div>
					</li>
				</ul>

				<h2
					id="business-value"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					中小企业价值
				</h2>

				<div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
					<h3 className="mb-4 text-xl font-semibold text-slate-900">
						业务收益
					</h3>
					<ul className="grid gap-4 md:grid-cols-2">
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5 shrink-0 text-blue-600"
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
								<path d="M5 13l4 4L19 7" />
							</svg>
							<span>降低API理解和使用的技术门槛</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5 shrink-0 text-blue-600"
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
								<path d="M5 13l4 4L19 7" />
							</svg>
							<span>减少API文档维护成本</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5 shrink-0 text-blue-600"
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
								<path d="M5 13l4 4L19 7" />
							</svg>
							<span>加速API开发和迭代流程</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5 shrink-0 text-blue-600"
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
								<path d="M5 13l4 4L19 7" />
							</svg>
							<span>提升团队沟通和协作效率</span>
						</li>
					</ul>
				</div>

				<div className="mt-12 flex justify-center">
					<a
						href="/docs/getting-started"
						className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						开始使用 API-MCP
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="ml-2 h-5 w-5"
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
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
					</a>
				</div>
			</div>
		</article>
	);
}
