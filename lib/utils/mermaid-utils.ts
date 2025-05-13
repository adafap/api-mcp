/**
 * Mermaid工具函数
 * 用于处理和修复Mermaid代码，确保符合Mermaid规范
 */
import mermaid from "mermaid";

/**
 * 修复Mermaid代码
 * 主要用于确保代码格式正确，特别是对lineChart和xyChart等新特性的支持
 */
export function fixMermaidCode(mermaidCode: string): string {
	// 空代码检查
	if (!mermaidCode || typeof mermaidCode !== "string") {
		return mermaidCode;
	}

	let fixedCode = mermaidCode.trim();

	// 提取配置（如果有）
	const configMatch = fixedCode.match(/^%%\{.*?\}%%/s);
	const configPart = configMatch ? configMatch[0] : "";

	// 如果有配置，从代码中移除
	if (configPart) {
		fixedCode = fixedCode.replace(configPart, "").trim();
	}

	// 检查是否是lineChart类型，如果是则转换为pie chart
	if (fixedCode.includes("lineChart")) {
		// 提取数据以转换为xychart图表
		const data = extractLineChartData(fixedCode);

		// 创建xychart图表代码
		let xyChartCode = "xychart-beta";

		// 添加标题
		if (data.title) {
			xyChartCode += `\n    title "${data.title}"`;
		}

		// 添加x轴和y轴
		xyChartCode += `\n    x-axis "${data.xAxis}"`;
		xyChartCode += `\n    y-axis "${data.yAxis}"`;

		// 添加数据系列
		xyChartCode += `\n    line "${data.series}"`;

		// 添加数据点
		for (const item of data.data) {
			xyChartCode += `\n    "${item.date}" ${item.value}`;
		}

		// 使用转换后的xychart图表替代原始的lineChart代码
		fixedCode = xyChartCode;
	} else {
		// 检测其他图表类型
		const chartTypeMatch = fixedCode.match(
			/^(flowchart|sequenceDiagram|classDiagram|stateDiagram|entityRelationshipDiagram|journey|gantt|pie|graph|erDiagram|gitGraph|timeline|mindmap|xychart-beta)(?:\s|$)/m,
		);

		// 如果没有识别到图表类型，但内容看起来像是flowchart
		if (
			!chartTypeMatch &&
			(fixedCode.includes("->") || fixedCode.includes("--"))
		) {
			// 添加flowchart前缀
			fixedCode = `flowchart TD\n${fixedCode}`;
		}
	}

	// 重新组合代码，确保配置在最前面
	if (configPart) {
		fixedCode = `${configPart}\n${fixedCode}`;
	}

	return fixedCode;
}

/**
 * 创建备用图表代码
 * 当Mermaid渲染失败时，生成一个简单的可显示图表
 */
export function createFallbackChart(title: string): string {
	return `flowchart TD
    subgraph "${title || "数据图表"}"
      A["数据已收集"] --> B["查看下方数据表格"]
    end`;
}

/**
 * 从折线图代码中提取数据
 * 支持lineChart和xychart-beta两种格式
 * 用于在图表无法渲染时显示数据表格
 */
export function extractLineChartData(mermaidCode: string): {
	title: string;
	xAxis: string;
	yAxis: string;
	series: string;
	data: Array<{
		date: string;
		value: string;
		trend: "up" | "down" | "neutral";
	}>;
} {
	try {
		const lines = mermaidCode.split("\n");
		const title = "";
		const xAxis = "";
		const yAxis = "";
		const series = "";
		const data = [];

		// 提取标题
		const titleMatch = mermaidCode.match(/title\s+([^\n]+)/);
		const extractedTitle = titleMatch ? titleMatch[1].trim() : "";

		// 提取坐标轴标题
		const xAxisMatch = mermaidCode.match(/x-axis\s+([^\n]+)/i);
		const extractedXAxis = xAxisMatch ? xAxisMatch[1].trim() : "";

		const yAxisMatch = mermaidCode.match(/y-axis\s+([^\n]+)/i);
		const extractedYAxis = yAxisMatch ? yAxisMatch[1].trim() : "";

		// 尝试提取数据点
		for (const line of lines) {
			const dataPointMatch = line.match(/\s*"([^"]+)"\s*:\s*(\d+)/);
			if (dataPointMatch) {
				const date = dataPointMatch[1].trim();
				const value = dataPointMatch[2];

				// 尝试判断趋势
				let trend: "up" | "down" | "neutral" = "neutral";
				if (data.length > 0) {
					const lastValue = Number(data[data.length - 1].value);
					const currentValue = Number(value);
					if (currentValue > lastValue) {
						trend = "up";
					} else if (currentValue < lastValue) {
						trend = "down";
					}
				}

				data.push({ date, value, trend });
			}
		}

		return {
			title: extractedTitle || title,
			xAxis: extractedXAxis || xAxis,
			yAxis: extractedYAxis || yAxis,
			series,
			data,
		};
	} catch (error) {
		console.error("Failed to extract chart data:", error);
		return {
			title: "",
			xAxis: "",
			yAxis: "",
			series: "",
			data: [],
		};
	}
}

/**
 * 预验证Mermaid代码是否有效
 * 使用try-catch进行安全检查，避免直接渲染时出错
 * @param mermaidCode Mermaid图表代码
 * @returns {boolean} 代码是否有效
 */
export async function validateMermaidCode(
	mermaidCode: string,
	mermaidInstance: typeof mermaid,
): Promise<{ isValid: boolean; error?: string }> {
	if (!mermaidCode || typeof mermaidCode !== "string") {
		return { isValid: false, error: "无效的Mermaid代码" };
	}

	try {
		// 尝试解析代码
		await mermaidInstance.parse(mermaidCode);

		// 检查常见问题
		const issues = checkCommonIssues(mermaidCode);
		if (issues) {
			return { isValid: false, error: issues };
		}

		return { isValid: true };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Mermaid代码验证失败:", errorMessage);
		return { isValid: false, error: errorMessage };
	}
}

/**
 * 检查Mermaid代码的常见问题
 */
function checkCommonIssues(mermaidCode: string): string | null {
	// 检查是否包含图表类型
	const hasChartType =
		/^(flowchart|sequenceDiagram|classDiagram|stateDiagram|entityRelationshipDiagram|journey|gantt|pie|graph|erDiagram|gitGraph|timeline|mindmap|xychart-beta)/m.test(
			mermaidCode,
		);

	if (!hasChartType) {
		return "缺少图表类型声明";
	}

	// 检查括号匹配
	const brackets = { "(": 0, "{": 0, "[": 0 };
	for (const char of mermaidCode) {
		if (char === "(") brackets["("]++;
		if (char === ")") brackets["("]--;
		if (char === "{") brackets["{"]++;
		if (char === "}") brackets["{"]--;
		if (char === "[") brackets["["]++;
		if (char === "]") brackets["["]--;

		// 如果发现负值，说明有右括号无对应左括号
		if (brackets["("] < 0 || brackets["{"] < 0 || brackets["["] < 0) {
			return "括号不匹配";
		}
	}

	// 最终检查括号是否全部闭合
	if (brackets["("] !== 0 || brackets["{"] !== 0 || brackets["["] !== 0) {
		return "括号不匹配";
	}

	// 检查无效的连接符
	if (
		/[^-]-+>(?!>)/g.test(mermaidCode) ||
		/[^-]-+(?!>)(?!-)/g.test(mermaidCode)
	) {
		return "可能包含无效的连接符";
	}

	return null;
}

/**
 * Safe Mermaid code rendering
 * Validate before rendering, provide error handling
 */
export async function safeRenderMermaid(
	element: HTMLElement,
	code: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// 首先尝试解析代码是否有效
		await mermaid.parse(code);

		// 渲染图表
		const svgCode = await mermaid.render(`mermaid-${Date.now()}`, code);
		element.innerHTML = svgCode.svg;
		return { success: true };
	} catch (error) {
		console.error("Mermaid rendering error:", error);
		element.innerHTML = `<div class="p-4 text-red-500 border border-red-300 rounded">
			<p>图表渲染出错</p>
			<pre class="text-xs mt-2">${error instanceof Error ? error.message : String(error)}</pre>
		</div>`;
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
