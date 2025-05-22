export default function SwaggerDocs() {
	return (
		<article className="container mx-auto max-w-3xl pb-16">
			<header className="mb-10 border-b pb-4">
				<h1
					id="swagger-docs"
					className="mb-3 text-4xl font-bold text-slate-900"
				>
					Swagger文档集成
				</h1>
				<p className="text-lg text-slate-600">
					导入、查询与管理Swagger API文档
				</p>
			</header>

			<div className="prose prose-slate max-w-none">
				<div className="lead-text mb-8 text-lg text-slate-700">
					API-MCP平台为中小型企业提供了强大的Swagger文档集成功能，让您轻松导入Swagger文档，通过自然语言对话快速获取API信息，直观地可视化API数据，甚至通过对话方式修改文档内容。
				</div>

				<h2
					id="import-swagger"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					导入Swagger文档
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP支持多种方式导入Swagger文档，帮助您快速将现有API纳入智能管理：
				</p>

				<div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
					<h3
						id="import-methods"
						className="mb-4 text-xl font-semibold text-amber-800"
					>
						导入方式
					</h3>
					<ul className="space-y-3 text-amber-700">
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-1 h-5 w-5 shrink-0 text-amber-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								<strong>URL导入</strong>：直接输入Swagger文档URL进行导入
							</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-1 h-5 w-5 shrink-0 text-amber-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								<strong>文件上传</strong>
								：上传本地JSON或YAML格式的Swagger定义文件
							</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-1 h-5 w-5 shrink-0 text-amber-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								<strong>API导入</strong>
								：通过API-MCP的API接口自动化导入Swagger文档
							</span>
						</li>
					</ul>
				</div>

				<h2
					id="ai-query"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					AI驱动的文档查询
				</h2>
				<p className="mt-4 text-slate-700">
					导入Swagger文档后，您可以使用自然语言提问来快速了解API细节，无需翻阅复杂的技术文档：
				</p>

				<div className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4">
					<pre className="text-sm text-slate-50">
						{`// 示例问题：
"用户注册API需要哪些参数？"
"获取产品列表API的返回格式是什么？"
"哪些API需要管理员权限？"
"支付流程涉及的所有API有哪些？"`}
					</pre>
				</div>

				<h2
					id="data-visualization"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					API数据可视化
				</h2>

				<p className="mt-4 text-slate-700">
					API-MCP提供多种可视化方式，帮助您直观了解API架构和数据：
				</p>

				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3 className="mb-2 text-lg font-semibold text-slate-900">
							柱状图与图表
						</h3>
						<p className="text-slate-600">
							自动将API数据转换为柱状图、饼图等可视化图表，帮助您快速理解数据分布和趋势。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3 className="mb-2 text-lg font-semibold text-slate-900">
							API关系图
						</h3>
						<p className="text-slate-600">
							直观展示API之间的关系和依赖，帮助您了解系统架构和数据流向。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3 className="mb-2 text-lg font-semibold text-slate-900">
							参数结构树
						</h3>
						<p className="text-slate-600">
							以树状结构展示API参数和响应格式，使复杂的数据结构一目了然。
						</p>
					</div>

					<div className="rounded-lg border bg-white p-5 shadow-sm">
						<h3 className="mb-2 text-lg font-semibold text-slate-900">
							数据表格
						</h3>
						<p className="text-slate-600">
							以表格形式展示API列表、参数详情等信息，支持排序、筛选和搜索。
						</p>
					</div>
				</div>

				<h2
					id="interactive-modification"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					通过对话修改API文档
				</h2>

				<p className="mt-4 text-slate-700">
					API-MCP的创新功能之一是允许您通过自然语言对话来修改和更新Swagger文档内容：
				</p>

				<div className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4">
					<pre className="text-sm text-slate-50">
						{`// 修改示例：
"为用户注册API添加邮箱验证字段"
"修改产品查询API的分页默认值为20"
"为订单API添加新的状态码描述"
"更新支付API的安全要求，添加OAuth认证"`}
					</pre>
				</div>

				<div className="mt-8 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
					<div className="flex">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-3 h-6 w-6 flex-shrink-0 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h3 className="text-lg font-semibold text-blue-800">变更管理</h3>
							<p className="mt-1 text-blue-700">
								所有通过对话进行的修改都会被记录在变更日志中，并支持版本控制，确保您可以随时回滚或查看API文档的修改历史。
							</p>
						</div>
					</div>
				</div>

				<h2
					id="integration-examples"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					集成示例
				</h2>

				<h3
					id="import-example"
					className="mt-6 text-xl font-semibold text-slate-900"
				>
					导入Swagger文档示例
				</h3>

				<div className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4">
					<pre className="text-sm text-slate-50">
						{`// 通过API导入Swagger文档
async function importSwaggerDoc(url) {
  const response = await fetch('/api/mcp/import-swagger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'url',
      location: url
    })
  });
  
  return await response.json();
}

// 使用示例
importSwaggerDoc('https://api.example.com/swagger.json');`}
					</pre>
				</div>

				<h3
					id="query-example"
					className="mt-6 text-xl font-semibold text-slate-900"
				>
					自然语言查询示例
				</h3>

				<div className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4">
					<pre className="text-sm text-slate-50">
						{`// 使用自然语言查询API信息
async function querySwaggerDoc(question) {
  const response = await fetch('/api/mcp/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        userQuery: question,
        type: 'swagger_query'
      }
    })
  });
  
  return await response.json();
}

// 使用示例
querySwaggerDoc('用户认证流程涉及哪些API？');`}
					</pre>
				</div>

				<h2
					id="business-benefits"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					中小企业收益
				</h2>

				<div className="mt-6 rounded-lg bg-emerald-50 p-6">
					<h3 className="mb-4 text-xl font-semibold text-emerald-800">
						业务价值
					</h3>
					<ul className="space-y-3 text-emerald-700">
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
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
							<span>减少API文档管理的技术门槛，提高非技术人员对API的理解</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
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
							<span>加速API开发和迭代，降低沟通成本</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
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
							<span>提升API文档质量，减少错误和不一致</span>
						</li>
						<li className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
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
							<span>通过可视化和AI辅助，提高API设计和使用效率</span>
						</li>
					</ul>
				</div>
			</div>
		</article>
	);
}
