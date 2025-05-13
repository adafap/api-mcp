"use client";

import { useMemo, useEffect, useRef } from "react";
import ReactEcharts from "echarts-for-react";

/**
 * 散点图组件类型定义
 */
interface ScatterChartProps {
	data?: Array<Record<string, number>>;
	dataSource?: Array<Record<string, number>>;
	bindData?: { type: "JSExpression"; value: string };
	width?: number | string;
	height?: number | string;
	xAxis?: {
		name?: string;
		min?: number;
		max?: number;
		type?: "value" | "category" | "time" | "log";
	};
	yAxis?: {
		name?: string;
		min?: number;
		max?: number;
		type?: "value" | "category" | "time" | "log";
	};
	symbolSize?: number | ((value: [number, number]) => number);
	colors?: string[];
	className?: string;
	title?: string;
	showLegend?: boolean;
	series?: Array<{
		name?: string;
		dataKey?: string;
		xField?: string;
		yField?: string;
	}>;
	showTooltip?: boolean;
}

/**
 * 散点图组件 - 使用ECharts实现
 * 适用于展示数据分布、聚类和相关性分析
 */
export const ScatterChartComponent = ({
	data = [],
	dataSource = [],
	bindData,
	width = "100%",
	height = 400,
	xAxis = { type: "value" },
	yAxis = { type: "value" },
	symbolSize = 10,
	colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272"],
	className,
	title,
	showLegend = true,
	series = [{ name: "Scatter Data", xField: "x", yField: "y" }],
	showTooltip = true,
}: ScatterChartProps) => {
	const chartRef = useRef<ReactEcharts>(null);

	// 获取图表数据
	const chartData = useMemo(() => {
		// 优先使用直接传入的dataSource
		if (Array.isArray(dataSource) && dataSource.length > 0) {
			return dataSource;
		}

		// 其次使用data属性
		if (data && data.length > 0) {
			return data;
		}

		// 尝试从渲染器上下文获取数据 (保留兼容性)
		if (bindData && bindData.type === "JSExpression") {
			try {
				// 在实际渲染器中，这里会由渲染引擎计算表达式
				const contextData = (
					window as { __RENDER_CONTEXT__?: { [key: string]: unknown[] } }
				).__RENDER_CONTEXT__?.[bindData.value];
				if (Array.isArray(contextData) && contextData.length > 0) {
					return contextData;
				}
			} catch (e) {
				console.error("计算散点图数据失败:", e);
			}
		}

		// 返回空数组，不提供静态数据
		return [];
	}, [dataSource, data, bindData]);

	// 监听窗口大小变化，重新渲染图表
	useEffect(() => {
		const handleResize = () => {
			if (chartRef.current) {
				const echartsInstance = chartRef.current.getEchartsInstance();
				echartsInstance.resize();
			}
		};

		window.addEventListener("resize", handleResize);

		// 组件挂载后立即调整大小
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// 生成ECharts配置
	const getOption = useMemo(() => {
		if (chartData.length === 0) {
			return {
				title: {
					text: title || "No Data",
					left: "center",
				},
			};
		}

		// 处理系列数据
		const processedSeries = series.map((s) => {
			const seriesData = chartData.map((item) => [
				Number(item[s.xField || "x"]),
				Number(item[s.yField || "y"]),
			]);

			return {
				name: s.name || "Scatter Data",
				type: "scatter",
				data: seriesData,
				symbolSize,
			};
		});

		// 设置散点图配置
		return {
			title: title
				? {
						text: title,
						left: "center",
					}
				: undefined,
			tooltip: showTooltip
				? {
						trigger: "item",
						formatter: (params: { data: [number, number] }) =>
							`(${params.data[0]}, ${params.data[1]})`,
					}
				: undefined,
			legend: showLegend
				? {
						data: series.map((s) => s.name || "Scatter Data"),
						bottom: 0,
					}
				: undefined,
			xAxis,
			yAxis,
			color: colors,
			series: processedSeries,
		};
	}, [
		chartData,
		title,
		showTooltip,
		showLegend,
		series,
		xAxis,
		yAxis,
		colors,
		symbolSize,
	]);

	return (
		<div className={className}>
			<ReactEcharts
				ref={chartRef}
				option={getOption}
				style={{
					height: typeof height === "number" ? `${height}px` : height,
					width: typeof width === "number" ? `${width}px` : width,
				}}
				opts={{ renderer: "canvas" }}
				notMerge={true}
			/>
		</div>
	);
};
