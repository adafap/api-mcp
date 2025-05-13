"use client";

import React from "react";
import ReactEcharts from "echarts-for-react";
import { Card } from "./card";

interface ChartProps {
	type:
		| "line"
		| "bar"
		| "pie"
		| "scatter"
		| "radar"
		| "heatmap"
		| "funnel"
		| "gauge";
	data?: Array<Record<string, unknown>>;
	dataSource?: Array<Record<string, unknown>>;
	width?: string | number;
	height?: string | number;
	title?: string;
	subTitle?: string;
	loading?: boolean;
	className?: string;
	options?: Record<string, unknown>;
	[key: string]: unknown;
}

/**
 * Chart Component
 * A wrapper component for various chart types using ECharts
 */
export const Chart: React.FC<ChartProps> = ({
	type,
	data,
	dataSource,
	width = "100%",
	height = 400,
	title,
	subTitle,
	loading = false,
	className,
	options = {},
	...props
}) => {
	// Get chart data
	const chartData = React.useMemo(() => {
		if (Array.isArray(dataSource) && dataSource.length > 0) {
			return dataSource;
		}
		if (Array.isArray(data) && data.length > 0) {
			return data;
		}
		return [];
	}, [data, dataSource]);

	// Monitor window size changes
	React.useEffect(() => {
		const handleResize = () => {
			if (chartInstance.current) {
				const echartsInstance = chartInstance.current.getEchartsInstance();
				echartsInstance.resize();
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const chartInstance = React.useRef<ReactEcharts>(null);

	// Generate chart options based on type
	const getChartOptions = React.useMemo(() => {
		if (chartData.length === 0) {
			return {
				title: {
					text: title || "No Data",
					subtext: subTitle,
					left: "center",
				},
			};
		}

		const baseOptions = {
			title: title
				? {
						text: title,
						subtext: subTitle,
						left: "center",
					}
				: undefined,
			tooltip: {
				trigger: "item",
			},
			grid: {
				left: "3%",
				right: "4%",
				bottom: "3%",
				containLabel: true,
			},
			...options,
		};

		return baseOptions;
	}, [chartData, title, subTitle, options]);

	return (
		<Card className={className} loading={loading}>
			<ReactEcharts
				ref={chartInstance}
				option={getChartOptions}
				style={{
					height: typeof height === "number" ? `${height}px` : height,
					width: typeof width === "number" ? `${width}px` : width,
				}}
				opts={{ renderer: "canvas" }}
				notMerge={true}
			/>
		</Card>
	);
};
