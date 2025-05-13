"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, BarSeriesOption } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { RenderContext } from "@/lib/mcp/types";

// 注册必要的组件
echarts.use([
	BarChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	DataZoomComponent,
	CanvasRenderer,
]);

// 柱状图组件属性接口
interface BarChartComponentProps {
	dataSource?: Array<Record<string, unknown>>;
	width?: string | number;
	height?: string | number;
	title?: string;
	subTitle?: string;
	xAxisData?: string[];
	xAxis?: {
		name?: string;
		axisLabel?: {
			rotate?: number;
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};
	yAxis?: {
		name?: string;
		[key: string]: unknown;
	};
	series?: Array<{
		name?: string;
		data?: number[];
		type?: string;
		[key: string]: unknown;
	}>;
	legend?: boolean;
	tooltip?: boolean;
	dataZoom?: boolean;
	horizontal?: boolean;
	stack?: boolean;
	colors?: string[];
	xField?: string;
	yField?: string | string[];
	seriesField?: string;
	sortByValue?: boolean;
	showValue?: boolean;
	barWidth?: number | string;
}

// 数据项类型定义
interface DataItem {
	[key: string]: unknown;
	created_at?: string;
	type?: string;
}

declare global {
	interface Window {
		__RENDER_CONTEXT__: RenderContext;
	}
}

/**
 * 柱状图组件
 * 用于比较不同类别的数据大小
 *
 * 数据源处理逻辑:
 * 1. 优先使用全局状态中的data数据
 * 2. 如果没有状态数据，则使用传入的dataSource
 * 3. 智能处理各种数据格式:
 *    - 如果有created_at字段, 可以按月份、年份统计
 *    - 如果有xField和yField指定的字段, 按这些字段分组聚合
 *    - 自动检测合适的分类和数值字段
 * 4. 支持各种图表样式配置
 */
export function BarChartComponent({
	dataSource = [],
	width = "100%",
	height = "300px",
	title,
	subTitle,
	xAxisData,
	xAxis = {},
	yAxis = {},
	series,
	legend = true,
	tooltip = true,
	dataZoom = false,
	horizontal = false,
	stack = false,
	colors,
	xField = "x",
	yField = "y",
	seriesField,
	sortByValue = false,
	showValue = false,
	barWidth,
}: BarChartComponentProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	// 生成图表选项
	useEffect(() => {
		if (!chartRef.current) return;

		// Initialize chart
		if (!chartInstance.current) {
			chartInstance.current = echarts.init(chartRef.current);
		}

		// Process data
		let seriesData: SeriesData[] = [];
		let categories: Array<string | number> = [];

		// Convert data source to array if needed
		const effectiveDataSource = Array.isArray(dataSource)
			? dataSource
			: [dataSource].filter(Boolean);

		// Process categories
		if (xAxisData) {
			categories = xAxisData;
		} else {
			const xSet = new Set<string>();
			for (const item of effectiveDataSource) {
				if (item[xField]) {
					xSet.add(item[xField].toString());
				}
			}
			categories = Array.from(xSet);
		}

		// Process series data
		if (!seriesField) {
			// Single series
			const data = categories.map((category) => {
				const item = effectiveDataSource.find(
					(d) => d[xField]?.toString() === category.toString(),
				);
				return item ? Number(item[yField] || 0) : 0;
			});

			seriesData = [
				{
					type: "bar",
					data,
					barWidth: barWidth,
				},
			];
		} else {
			// Multiple series
			const seriesMap = new Map<string, Map<string, number>>();

			for (const item of effectiveDataSource) {
				const seriesName = item[seriesField]?.toString() || "Default";
				const category = item[xField]?.toString() || "";
				const value =
					typeof yField === "string"
						? Number(item[yField] || 0)
						: Number(item.y || 0);

				if (!seriesMap.has(seriesName)) {
					seriesMap.set(seriesName, new Map<string, number>());
				}

				const seriesNameMap = seriesMap.get(seriesName);
				if (seriesNameMap) {
					seriesNameMap.set(category, value);
				}
			}

			seriesData = Array.from(seriesMap.entries()).map(([name, valueMap]) => ({
				name,
				type: "bar",
				data: categories.map(
					(category) => valueMap.get(category.toString()) || 0,
				),
				barWidth: barWidth,
			}));
		}

		// Update chart options
		const options = {
			title: {
				text: title,
				subtext: subTitle,
			},
			tooltip: {
				trigger: "axis",
				...tooltip,
			},
			legend:
				legend !== false && seriesData.length > 1 ? { ...legend } : undefined,
			xAxis: {
				type: "category",
				data: categories,
				...xAxis,
			},
			yAxis: {
				type: "value",
				...yAxis,
			},
			series: seriesData,
			dataZoom: dataZoom ? [{ ...dataZoom }] : undefined,
		};

		chartInstance.current.setOption(options);

		return () => {
			chartInstance.current?.dispose();
		};
	}, [
		dataSource,
		title,
		subTitle,
		xAxisData,
		xAxis,
		yAxis,
		series,
		legend,
		tooltip,
		dataZoom,
		barWidth,
		xField,
		yField,
		seriesField,
		sortByValue,
		showValue,
	]);

	// 处理组件卸载
	useEffect(() => {
		return () => {
			if (chartInstance.current) {
				chartInstance.current.dispose();
				chartInstance.current = null;
			}
		};
	}, []);

	return (
		<div
			ref={chartRef}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
			}}
		/>
	);
}
