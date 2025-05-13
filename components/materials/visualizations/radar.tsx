"use client";

import { useMemo, useEffect, useRef } from "react";
import ReactEcharts from "echarts-for-react";

/**
 * 雷达图组件类型定义
 */
interface RadarChartProps {
	data?: Array<number[]>;
	dataSource?: Array<number[]>;
	bindData?: { type: "JSExpression"; value: string };
	indicators?: Array<{ name: string; max: number }>;
	seriesNames?: string[];
	width?: number | string;
	height?: number | string;
	colors?: string[];
	className?: string;
	title?: string;
	showLegend?: boolean;
	shape?: "polygon" | "circle";
	areaStyle?: boolean;
}

/**
 * 雷达图组件 - 使用ECharts实现
 * 适用于多维度数据的可视化比较
 */
export const RadarChartComponent = ({
	data = [],
	dataSource = [],
	bindData,
	indicators = [],
	seriesNames = [],
	width = "100%",
	height = 400,
	colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272"],
	className,
	title,
	showLegend = true,
	shape = "polygon",
	areaStyle = true,
}: RadarChartProps) => {
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
				console.error("计算雷达图数据失败:", e);
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
		if (chartData.length === 0 || indicators.length === 0) {
			return {
				title: {
					text: title || "No Data",
					left: "center",
				},
			};
		}

		// 设置雷达图配置
		return {
			title: title
				? {
						text: title,
						left: "center",
					}
				: undefined,
			tooltip: {
				trigger: "item",
			},
			legend: showLegend
				? {
						data: seriesNames.length > 0 ? seriesNames : ["Series 1"],
						bottom: 0,
					}
				: undefined,
			color: colors,
			radar: {
				shape,
				indicator: indicators,
			},
			series: [
				{
					type: "radar",
					data: chartData.map((item, index) => ({
						value: item,
						name: seriesNames[index] || `Series ${index + 1}`,
						areaStyle: areaStyle ? { opacity: 0.1 } : undefined,
					})),
				},
			],
		};
	}, [
		chartData,
		indicators,
		title,
		showLegend,
		seriesNames,
		shape,
		colors,
		areaStyle,
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
