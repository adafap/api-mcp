"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import {
	TooltipComponent,
	LegendComponent,
	TitleComponent,
} from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 注册必要的组件
echarts.use([
	PieChart,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	LabelLayout,
	CanvasRenderer,
]);

// 饼图组件属性接口
interface PieChartComponentProps {
	dataSource?:
		| Array<{ name: string; value: number }>
		| Array<Record<string, unknown>>;
	nameKey?: string;
	valueKey?: string;
	width?: string | number;
	height?: string | number;
	title?: string;
	subTitle?: string;
	radius?: number | string | (string | number)[];
	roseType?: "radius" | "area" | false;
	legend?: boolean;
	legendPosition?: "top" | "bottom" | "left" | "right";
	tooltip?: boolean;
	label?: boolean;
	labelPosition?: "inside" | "outside";
	colors?: string[];
}

/**
 * Pie Chart Component
 * Used to display proportion relationships between data
 */
export function PieChartComponent({
	dataSource = [],
	nameKey = "name",
	valueKey = "value",
	width = "100%",
	height = "300px",
	title,
	subTitle,
	radius = ["40%", "70%"],
	roseType = false,
	legend = true,
	legendPosition = "right",
	tooltip = true,
	label = true,
	labelPosition = "outside",
	colors,
}: PieChartComponentProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	// Process data
	const processData = () => {
		if (!dataSource || dataSource.length === 0) return [];

		return dataSource.map((item) => {
			if ("name" in item && "value" in item) {
				return item;
			}
			return {
				name: String(item[nameKey] || "Unknown"),
				value: Number(item[valueKey] || 0),
			};
		});
	};

	// 初始化和更新图表
	useEffect(() => {
		if (!chartRef.current) return;

		// 处理数据
		const data = processData();

		// 如果没有数据则显示无数据状态
		if (!data.length) {
			if (chartInstance.current) {
				chartInstance.current.dispose();
			}

			const chart = echarts.init(chartRef.current);
			chart.setOption({
				title: {
					text: "暂无数据",
					left: "center",
					top: "center",
					textStyle: {
						color: "#999",
						fontSize: 16,
						fontWeight: "normal",
					},
				},
			});
			chartInstance.current = chart;
			return;
		}

		// 初始化图表
		if (!chartInstance.current) {
			chartInstance.current = echarts.init(chartRef.current);
		}
		// 配置选项
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
						trigger: "item",
						formatter: "{a} <br/>{b}: {c} ({d}%)",
					}
				: undefined,
			legend: legend
				? {
						orient: ["left", "right"].includes(legendPosition)
							? "vertical"
							: "horizontal",
						[legendPosition]: 10,
					}
				: undefined,
			color: colors,
			series: [
				{
					name: title || "数据",
					type: "pie",
					radius: radius,
					roseType: roseType || undefined,
					itemStyle: {
						borderRadius: 8,
						borderWidth: 2,
					},
					label: {
						show: label,
						position: labelPosition,
						formatter: "{b}: {d}%",
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: "rgba(0, 0, 0, 0.5)",
						},
						label: {
							show: true,
							fontSize: 14,
							fontWeight: "bold",
						},
					},
					data: data,
				},
			],
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
		nameKey,
		valueKey,
		width,
		height,
		title,
		subTitle,
		radius,
		roseType,
		legend,
		legendPosition,
		tooltip,
		label,
		labelPosition,
		colors,
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
