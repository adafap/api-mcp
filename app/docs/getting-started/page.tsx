export default function GettingStarted() {
	return (
		<article className="container mx-auto max-w-3xl pb-16">
			<header className="mb-10 border-b pb-4">
				<h1
					id="getting-started"
					className="mb-3 text-4xl font-bold text-slate-900"
				>
					入门指南
				</h1>
				<p className="text-lg text-slate-600">
					快速掌握中小型企业的Swagger文档管理利器
				</p>
			</header>

			<div className="prose prose-slate max-w-none">
				<p className="lead-text mb-8 text-lg text-slate-700">
					本指南将帮助您快速上手API-MCP平台，从安装部署到导入Swagger文档，再到通过AI问答和数据可视化充分利用API资源，以提高您企业的API管理效率。
				</p>

				<h2
					id="installation"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					安装部署
				</h2>
				<p className="mt-4 text-slate-700">
					通过以下步骤在您的环境中部署API-MCP：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`# 克隆仓库
git clone https://github.com/yourusername/api-mcp.git

# 进入项目目录
cd api-mcp

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev`}</code>
				</pre>

				<h2
					id="environment-setup"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					环境配置
				</h2>
				<p className="mt-4 text-slate-700">
					创建一个 <code>.env</code> 文件（可以复制 <code>.env.example</code>
					），并配置以下关键环境变量：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`# MongoDB连接字符串
MONGODB_URI=mongodb://username:password@localhost:27017/api-mcp

# AI模型配置（至少需要配置一种）
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# API基础URL
API_BASE_URL=http://localhost:3000/api`}</code>
				</pre>

				<div className="my-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
					<p className="flex items-start">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-blue-600"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 16v-4" />
							<path d="M12 8h.01" />
						</svg>
						<span>
							对于中小型企业用户，我们推荐选择适合您预算的AI模型。不同的AI提供商在性能和成本上各有优势，您可以根据实际需求选择合适的模型。
						</span>
					</p>
				</div>

				<h2
					id="import-swagger"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					导入Swagger文档
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP平台支持多种方式导入和管理Swagger文档：
				</p>
				<ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-700">
					<li>
						<strong>通过Web界面导入</strong>：访问
						<code>http://localhost:3000/dashboard</code>
						，使用"导入Swagger"功能，您可以提供Swagger文档URL或上传本地文件。
					</li>
					<li>
						<strong>通过API导入</strong>
						：使用API-MCP提供的接口以编程方式导入Swagger文档，适合批量导入或自动化流程。
					</li>
				</ol>

				<p className="mt-4 text-slate-700">
					以下是使用API导入Swagger文档的示例代码：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`// 通过API导入Swagger文档
async function importSwaggerDoc(url) {
  const response = await fetch('/api/mcp/import-swagger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'url',
      location: url,
      name: '我的API文档'  // 文档在系统中的显示名称
    })
  });
  
  return await response.json();
}

// 使用示例
importSwaggerDoc('https://petstore.swagger.io/v2/swagger.json');`}</code>
				</pre>

				<h2
					id="ai-interaction"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					AI问答交互
				</h2>
				<p className="mt-4 text-slate-700">
					导入Swagger文档后，您可以使用自然语言与API文档进行交互，例如：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`// 使用AI问答功能查询API信息
async function queryAPI(question) {
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

// 示例问题
queryAPI('用户注册API需要哪些参数？');
queryAPI('查找订单API的响应格式是什么？');
queryAPI('哪些API需要管理员权限？');`}</code>
				</pre>

				<h2
					id="data-visualization"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					数据可视化
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP平台可以将API数据直观地呈现为各种可视化图表，特别是柱状图，帮助您快速理解数据：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`// 生成API数据可视化
async function visualizeData(query, visualType = 'bar') {
  const response = await fetch('/api/mcp/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        userQuery: query,
        type: 'visualization',
        params: {
          visualType: visualType  // 'bar'(柱状图), 'pie', 'line' 等
        }
      }
    })
  });
  
  return await response.json();
}

// 示例查询
visualizeData('以柱状图显示过去30天的用户注册量');
visualizeData('以饼图展示各API调用次数占比');`}</code>
				</pre>

				<h2
					id="content-modification"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					内容修改
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP的创新功能之一是允许您通过自然语言对话来修改Swagger文档内容：
				</p>
				<pre className="my-6 overflow-x-auto rounded-lg bg-slate-800 p-4 text-sm leading-relaxed text-slate-50">
					<code>{`// 通过自然语言修改API文档
async function modifyAPIDoc(instruction) {
  const response = await fetch('/api/mcp/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        userQuery: instruction,
        type: 'modify_docs'
      }
    })
  });
  
  return await response.json();
}

// 修改示例
modifyAPIDoc('为用户注册API添加邮箱验证字段');
modifyAPIDoc('修改产品查询API的分页默认值为20');
modifyAPIDoc('为支付API添加一个新的状态码描述');`}</code>
				</pre>

				<h2
					id="configuration-options"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					配置选项
				</h2>
				<p className="mt-4 text-slate-700">
					API-MCP支持多种配置选项，适应不同企业需求：
				</p>
				<div className="my-6 overflow-hidden rounded-lg border">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="bg-slate-100">
							<tr>
								<th className="px-6 py-3 font-semibold text-slate-900">选项</th>
								<th className="px-6 py-3 font-semibold text-slate-900">描述</th>
								<th className="px-6 py-3 font-semibold text-slate-900">
									默认值
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							<tr className="bg-white">
								<td className="px-6 py-4 font-medium text-slate-900">
									aiProvider
								</td>
								<td className="px-6 py-4 text-slate-700">使用的AI提供商</td>
								<td className="px-6 py-4 text-slate-500">openai</td>
							</tr>
							<tr className="bg-white">
								<td className="px-6 py-4 font-medium text-slate-900">
									defaultVisualType
								</td>
								<td className="px-6 py-4 text-slate-700">默认可视化类型</td>
								<td className="px-6 py-4 text-slate-500">bar</td>
							</tr>
							<tr className="bg-white">
								<td className="px-6 py-4 font-medium text-slate-900">
									enableContentModification
								</td>
								<td className="px-6 py-4 text-slate-700">启用内容修改功能</td>
								<td className="px-6 py-4 text-slate-500">true</td>
							</tr>
							<tr className="bg-white">
								<td className="px-6 py-4 font-medium text-slate-900">
									enableVersionControl
								</td>
								<td className="px-6 py-4 text-slate-700">启用文档版本控制</td>
								<td className="px-6 py-4 text-slate-500">true</td>
							</tr>
						</tbody>
					</table>
				</div>

				<h2
					id="business-benefits"
					className="mt-12 border-b pb-2 text-2xl font-bold text-slate-900"
				>
					企业收益
				</h2>
				<p className="mt-4 text-slate-700">
					对于中小型企业，API-MCP带来的价值包括：
				</p>
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<div className="flex items-start rounded-lg border bg-white p-4">
						<div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
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
						</div>
						<div>
							<h3 className="mb-1 text-base font-semibold text-slate-900">
								降低技术门槛
							</h3>
							<p className="text-sm text-slate-600">
								非技术人员可以通过自然语言轻松理解和使用API，无需专业知识。
							</p>
						</div>
					</div>

					<div className="flex items-start rounded-lg border bg-white p-4">
						<div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
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
						</div>
						<div>
							<h3 className="mb-1 text-base font-semibold text-slate-900">
								提升决策效率
							</h3>
							<p className="text-sm text-slate-600">
								通过可视化和AI分析，帮助管理层快速理解数据，做出更好的业务决策。
							</p>
						</div>
					</div>

					<div className="flex items-start rounded-lg border bg-white p-4">
						<div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
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
						</div>
						<div>
							<h3 className="mb-1 text-base font-semibold text-slate-900">
								加速开发流程
							</h3>
							<p className="text-sm text-slate-600">
								简化API文档的维护和更新过程，减少开发人员负担，加快迭代速度。
							</p>
						</div>
					</div>

					<div className="flex items-start rounded-lg border bg-white p-4">
						<div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
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
						</div>
						<div>
							<h3 className="mb-1 text-base font-semibold text-slate-900">
								节省人力成本
							</h3>
							<p className="text-sm text-slate-600">
								减少对专业API文档管理人员的依赖，让现有团队更高效地管理API资源。
							</p>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
