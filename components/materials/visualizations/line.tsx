"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart, LineSeriesOption } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	DataZoomComponent,
	MarkAreaComponent,
	MarkLineComponent,
	MarkPointComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// 注册必要的组件
echarts.use([
	LineChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	DataZoomComponent,
	MarkAreaComponent,
	MarkLineComponent,
	MarkPointComponent,
	CanvasRenderer,
]);

// 折线图组件属性接口
interface LineChartComponentProps {
	dataSource?: Array<Record<string, unknown>>;
	width?: string | number;
	height?: string | number;
	title?: string;
	subTitle?: string;
	xAxisData?: Array<string | number>;
	xAxis?: {
		name?: string;
		type?: "category" | "time" | "value";
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
		smooth?: boolean;
		[key: string]: unknown;
	}>;
	legend?: boolean;
	tooltip?: boolean;
	dataZoom?: boolean;
	smooth?: boolean;
	area?: boolean;
	colors?: string[];
	xField?: string;
	yField?: string | string[];
	seriesField?: string;
	markLine?:
		| boolean
		| {
				data: Array<Record<string, unknown>>;
		  };
	markPoint?:
		| boolean
		| {
				data: Array<Record<string, unknown>>;
		  };
}

interface SeriesData {
	name?: string;
	type?: string;
	data?: (number | null)[];
	smooth?: boolean;
	areaStyle?: Record<string, unknown>;
}

/**
 * 折线图组件
 * 用于展示数据随时间或顺序的变化趋势
 */
export function LineChartComponent({
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
	smooth = false,
	area = false,
	colors,
	xField = "x",
	yField = "y",
	seriesField,
	markLine,
	markPoint,
}: LineChartComponentProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	// 生成图表选项
	useEffect(() => {
		if (!chartRef.current) return;

		// 初始化图表
		if (!chartInstance.current) {
			chartInstance.current = echarts.init(chartRef.current);
		}

		// 处理数据
		let seriesData: SeriesData[] = [];
		let categories: Array<string | number> = [];

		// 如果直接提供了series数据，使用它
		if (series && series.length > 0) {
			seriesData = series;
			categories = xAxisData || [];
		}
		// 否则，从dataSource解析数据
		else if (dataSource && dataSource.length > 0) {
			// 1. 提取x轴类别
			if (xAxisData) {
				categories = xAxisData;
			} else {
				const xSet = new Set<string | number>();
				for (const item of dataSource) {
					if (item[xField] != null) {
						xSet.add(item[xField] as string | number);
					}
				}
				categories = Array.from(xSet);
			}

			// 2. 处理系列数据
			if (seriesField && dataSource.some((item) => item[seriesField])) {
				// 多系列模式：根据seriesField分组
				const seriesMap = new Map<string, Map<string, number>>();

				// 分组并收集数据
				for (const item of dataSource) {
					const seriesName = item[seriesField]?.toString() || "Default";
					const category = item[xField];
					const value =
						typeof yField === "string"
							? Number(item[yField] || 0)
							: Number(item.y || 0);

					if (!seriesMap.has(seriesName)) {
						seriesMap.set(seriesName, new Map<string, number>());
					}

					const seriesMapItem = seriesMap.get(seriesName);
					if (seriesMapItem) {
						seriesMapItem.set(String(category), value);
					}
				}

				// 转换为系列数据
				seriesData = Array.from(seriesMap.entries()).map(([name, dataMap]) => {
					const data = categories.map(
						(category) => dataMap.get(String(category)) || null,
					);
					return {
						name,
						type: "line",
						data,
						smooth,
						areaStyle: area ? {} : undefined,
					};
				});
			} else {
				// 单系列或多系列（基于yField）模式
				const yFields = Array.isArray(yField) ? yField : [yField];

				seriesData = yFields.map((field) => {
					// 创建映射以快速查找
					const dataMap = new Map<string, number>();
					for (const item of dataSource) {
						if (item[xField] != null && item[field] != null) {
							dataMap.set(String(item[xField]), Number(item[field]));
						}
					}

					const data = categories.map(
						(category) => dataMap.get(String(category)) || null,
					);

					return {
						name: field,
						type: "line",
						data,
						smooth,
						areaStyle: area ? {} : undefined,
					};
				});
			}
		}

		// 如果没有数据，显示无数据状态
		if (
			categories.length === 0 ||
			seriesData.every((s) => s.data?.length === 0)
		) {
			chartInstance.current.setOption({
				title: {
					text: "No Data",
					left: "center",
					top: "center",
					textStyle: {
						color: "#999",
						fontSize: 16,
						fontWeight: "normal",
					},
				},
			});
			return;
		}
		// 构建图表选项
		const option: echarts.EChartsCoreOption = {
			title: title
				? {
						text: title,
						subtext: subTitle,
						left: "center",
					}
				: undefined,
			tooltip: tooltip
				? {
						trigger: "axis",
						axisPointer: {
							type: "cross",
							label: {
								backgroundColor: "#6a7985",
							},
						},
					}
				: undefined,
			legend: legend
				? {
						type: "scroll",
						orient: "horizontal",
						bottom: 0,
					}
				: undefined,
			grid: {
				left: "3%",
				right: "4%",
				bottom: legend ? 40 : 10,
				top: title ? 60 : 30,
				containLabel: true,
			},
			dataZoom: dataZoom
				? [
						{
							type: "inside",
							start: 0,
							end: 100,
						},
						{
							start: 0,
							end: 100,
						},
					]
				: undefined,
			xAxis: {
				type: xAxis.type || "category",
				boundaryGap: false,
				data: categories,
				...xAxis,
			},
			yAxis: {
				type: "value",
				...yAxis,
			},
			color: colors,
			series: seriesData,
		};

		// 设置选项并渲染
		chartInstance.current.setOption(option);

		// 响应窗口大小变化
		const handleResize = () => {
			chartInstance.current?.resize();
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
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
		smooth,
		area,
		colors,
		xField,
		yField,
		seriesField,
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
