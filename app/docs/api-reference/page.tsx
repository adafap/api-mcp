export default function ApiReference() {
	return (
		<article className="container mx-auto max-w-3xl pb-16">
			<header className="mb-10 border-b pb-4">
				<h1
					id="api-reference"
					className="mb-3 text-4xl font-bold text-slate-900"
				>
					API参考
				</h1>
				<p className="text-lg text-slate-600">
					API-MCP平台提供的API端点详细文档
				</p>
			</header>

			<div className="prose prose-slate max-w-none">
				<p className="lead-text mb-8 text-lg text-slate-700">
					本文档提供了API-MCP平台API的详细参考信息，包括所有可用的端点、参数和响应格式。
				</p>

				<h2
					id="authentication"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					身份验证
				</h2>
				<p className="mt-4 text-slate-700">
					对于需要保护的API端点，您可能需要在请求头中包含认证信息：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>Authorization: Bearer YOUR_ACCESS_TOKEN</code>
				</pre>

				<div className="my-8 rounded-lg border border-amber-100 bg-amber-50 p-4 text-amber-800">
					<div className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-amber-600"
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
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
							<path d="M12 9v4" />
							<path d="M12 17h.01" />
						</svg>
						<span>
							在开发环境中，部分API端点可能不需要认证即可访问。但在生产环境中，建议为所有敏感操作启用适当的身份验证机制。
						</span>
					</div>
				</div>

				<h2
					id="endpoints"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					端点
				</h2>

				<div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center">
						<span className="mr-3 inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
							POST
						</span>
						<h3 id="execute-tool" className="text-xl font-bold text-slate-900">
							执行工具API
						</h3>
					</div>
					<div className="mb-4 rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
						/api/mcp/execute-tool
					</div>
					<p className="mb-6 text-slate-700">
						执行已注册的API工具。通过提供工具ID和所需参数，直接调用特定API功能。
					</p>

					<div className="mb-6">
						<h4
							id="execute-tool-parameters"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							请求体
						</h4>
						<div className="overflow-hidden rounded-lg border">
							<table className="w-full border-collapse text-left text-sm">
								<thead className="bg-slate-100">
									<tr>
										<th className="px-4 py-2 font-semibold text-slate-900">
											字段
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											类型
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											描述
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											必填
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											toolId
										</td>
										<td className="px-4 py-2 text-slate-700">字符串</td>
										<td className="px-4 py-2 text-slate-700">要执行的工具ID</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											params
										</td>
										<td className="px-4 py-2 text-slate-700">对象</td>
										<td className="px-4 py-2 text-slate-700">工具所需的参数</td>
										<td className="px-4 py-2 text-slate-500">否</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div>
						<h4
							id="execute-tool-response"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							响应
						</h4>
						<pre className="overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
							<code>{`{
  "success": true,
  "data": {
    // 执行结果数据
  }
}

// 错误响应
{
  "success": false,
  "error": "错误描述",
  "message": "执行工具失败"
}`}</code>
						</pre>
					</div>
				</div>

				<div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center">
						<span className="mr-3 inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
							POST
						</span>
						<h3 id="process-api" className="text-xl font-bold text-slate-900">
							处理API
						</h3>
					</div>
					<div className="mb-4 rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
						/api/mcp/process
					</div>
					<p className="mb-6 text-slate-700">
						处理自然语言查询并将其转换为相应的API调用。这是AI功能的核心入口点。
					</p>

					<div className="mb-6">
						<h4
							id="process-api-parameters"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							请求体
						</h4>
						<div className="overflow-hidden rounded-lg border">
							<table className="w-full border-collapse text-left text-sm">
								<thead className="bg-slate-100">
									<tr>
										<th className="px-4 py-2 font-semibold text-slate-900">
											字段
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											类型
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											描述
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											必填
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											request
										</td>
										<td className="px-4 py-2 text-slate-700">对象</td>
										<td className="px-4 py-2 text-slate-700">请求对象</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											request.userQuery
										</td>
										<td className="px-4 py-2 text-slate-700">字符串</td>
										<td className="px-4 py-2 text-slate-700">
											用户的自然语言查询
										</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											request.type
										</td>
										<td className="px-4 py-2 text-slate-700">字符串</td>
										<td className="px-4 py-2 text-slate-700">
											请求类型，"tool" 或 "render"
										</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											request.params
										</td>
										<td className="px-4 py-2 text-slate-700">对象</td>
										<td className="px-4 py-2 text-slate-700">可选的额外参数</td>
										<td className="px-4 py-2 text-slate-500">否</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div>
						<h4
							id="process-api-response"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							响应
						</h4>
						<pre className="overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
							<code>{`{
  "success": true,
  "data": {
    // 处理结果数据，根据请求类型不同而变化
  }
}

// 错误响应
{
  "success": false,
  "error": "错误描述",
  "message": "处理请求失败"
}`}</code>
						</pre>
					</div>
				</div>

				<div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center">
						<span className="mr-3 inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
							POST
						</span>
						<h3
							id="register-datasources"
							className="text-xl font-bold text-slate-900"
						>
							注册数据源API
						</h3>
					</div>
					<div className="mb-4 rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
						/api/mcp/process (action=register_datasources)
					</div>
					<p className="mb-6 text-slate-700">
						注册应用程序的数据源，使其可用于MCP系统。
					</p>

					<div className="mb-6">
						<h4
							id="register-datasources-parameters"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							请求体
						</h4>
						<div className="overflow-hidden rounded-lg border">
							<table className="w-full border-collapse text-left text-sm">
								<thead className="bg-slate-100">
									<tr>
										<th className="px-4 py-2 font-semibold text-slate-900">
											字段
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											类型
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											描述
										</th>
										<th className="px-4 py-2 font-semibold text-slate-900">
											必填
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											action
										</td>
										<td className="px-4 py-2 text-slate-700">字符串</td>
										<td className="px-4 py-2 text-slate-700">
											固定值："register_datasources"
										</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-2 font-medium text-slate-900">
											appId
										</td>
										<td className="px-4 py-2 text-slate-700">字符串</td>
										<td className="px-4 py-2 text-slate-700">应用程序ID</td>
										<td className="px-4 py-2 text-emerald-600">是</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div>
						<h4
							id="register-datasources-response"
							className="mb-3 text-base font-semibold text-slate-900"
						>
							响应
						</h4>
						<pre className="overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
							<code>{`{
  "success": true,
  "message": "数据源注册成功",
  "count": 5,       // 注册的数据源数量
  "toolCount": 5    // 注册的工具数量
}

// 错误响应
{
  "success": false,
  "error": "错误描述",
  "message": "注册数据源失败"
}`}</code>
						</pre>
					</div>
				</div>

				<div className="mt-12 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-800">
					<h3 className="mb-2 font-semibold">API更新通知</h3>
					<p>
						我们会定期更新API以提供更好的功能和性能。请关注我们的
						<a
							href="/docs/changelog"
							className="font-medium text-blue-600 hover:underline"
						>
							变更日志
						</a>
						以获取最新更新。
					</p>
				</div>

				<h2
					id="open-apis"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					开源API资源
				</h2>
				<p className="mt-4 text-slate-700">
					除了API-MCP平台API外，您还可以利用以下开源API资源来扩展您的应用功能：
				</p>

				<div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
					<div className="flex items-start">
						<div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
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
								<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
								<path d="M9 18c-4.51 2-5-2-7-2" />
							</svg>
						</div>
						<div className="flex-1">
							<h3 className="mb-2 text-xl font-bold text-slate-900">
								Public APIs
							</h3>
							<p className="mb-4 text-slate-600">
								<a
									href="https://github.com/public-apis/public-apis"
									target="_blank"
									rel="noopener noreferrer"
									className="font-medium text-indigo-600 hover:underline"
								>
									Public APIs
								</a>{" "}
								是GitHub上维护的一个免费API集合，收录了数百个可用于各种项目的公开API。这些API按类别分类，包括天气、金融、娱乐、新闻等多个领域。
							</p>
							<div className="space-y-2 text-sm text-slate-700">
								<p>
									<span className="font-semibold">主要特点：</span>
								</p>
								<ul className="list-disc pl-5 space-y-1">
									<li>按类别组织的数百个免费API</li>
									<li>标注了认证方式（无认证、API密钥、OAuth等）</li>
									<li>标明了是否支持HTTPS和CORS</li>
									<li>社区维护，持续更新</li>
								</ul>
								<p className="mt-4">
									<a
										href="https://github.com/public-apis/public-apis"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center rounded-md border border-indigo-600 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
									>
										查看公开API集合
										<svg
											className="ml-1.5 h-4 w-4"
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
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
