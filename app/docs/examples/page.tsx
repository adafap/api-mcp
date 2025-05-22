export default function Examples() {
	return (
		<article className="container mx-auto px-4 py-6">
			<header>
				<h1 id="examples" className="text-3xl font-bold mb-4">
					使用示例
				</h1>
			</header>
			<div>
				<p className="mb-4">
					以下示例将帮助您了解如何在各种场景中使用我们的产品。
				</p>

				<h2 id="basic-query" className="text-2xl font-bold mt-8 mb-4">
					基本查询
				</h2>
				<p className="mb-4">以下示例展示了如何执行基本查询：</p>
				<pre className="bg-gray-100 p-4 rounded mb-4">
					<code>{`import { Client } from 'our-product';

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

async function performBasicQuery() {
  const result = await client.query('查询关键词');
  console.log(result);
}

performBasicQuery().catch(console.error);`}</code>
				</pre>

				<h2 id="filtering" className="text-2xl font-bold mt-8 mb-4">
					筛选结果
				</h2>
				<p className="mb-4">您可以使用筛选器来限制查询结果：</p>
				<pre className="bg-gray-100 p-4 rounded mb-4">
					<code>{`import { Client } from 'our-product';

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

async function filterResults() {
  const results = await client.query('查询关键词', {
    filters: {
      category: 'documents',
      date: { $gt: '2023-01-01' }
    }
  });
  
  console.log(results);
}

filterResults().catch(console.error);`}</code>
				</pre>

				<h2 id="pagination" className="text-2xl font-bold mt-8 mb-4">
					分页
				</h2>
				<p className="mb-4">处理大量结果时，您可以使用分页功能：</p>
				<pre className="bg-gray-100 p-4 rounded mb-4">
					<code>{`import { Client } from 'our-product';

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

async function paginateResults() {
  // 获取第一页
  const page1 = await client.query('查询关键词', {
    page: 1,
    limit: 10
  });
  
  console.log('第一页结果:', page1.items);
  
  // 获取第二页
  const page2 = await client.query('查询关键词', {
    page: 2,
    limit: 10
  });
  
  console.log('第二页结果:', page2.items);
}

paginateResults().catch(console.error);`}</code>
				</pre>

				<h2 id="error-handling" className="text-2xl font-bold mt-8 mb-4">
					错误处理
				</h2>
				<p className="mb-4">以下示例展示了如何处理错误：</p>
				<pre className="bg-gray-100 p-4 rounded mb-4">
					<code>{`import { Client, APIError } from 'our-product';

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

async function handleErrors() {
  try {
    const result = await client.query('查询关键词');
    console.log(result);
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API错误:', error.message);
      console.error('状态码:', error.statusCode);
    } else {
      console.error('未知错误:', error);
    }
  }
}

handleErrors();`}</code>
				</pre>
			</div>
		</article>
	);
}
