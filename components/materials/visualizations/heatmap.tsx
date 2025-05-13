'use client';

import { useMemo, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';

/**
 * 热力图组件类型定义
 */
interface HeatmapChartProps {
  data?: any[];
  dataSource?: any[];
  bindData?: { type: 'JSExpression'; value: string };
  width?: number | string;
  height?: number | string;
  xAxis?: {
    name?: string;
    data?: string[];
    type?: 'category' | 'value';
  };
  yAxis?: {
    name?: string;
    data?: string[];
    type?: 'category' | 'value';
  };
  colors?: string[];
  className?: string;
  title?: string;
  showLegend?: boolean;
  visualMap?: {
    min?: number;
    max?: number;
    calculable?: boolean;
    orient?: 'horizontal' | 'vertical';
    left?: string | number;
    bottom?: string | number;
    inRange?: {
      color?: string[];
    };
  };
  showTooltip?: boolean;
  label?: {
    show?: boolean;
    formatter?: string | ((params: any) => string);
  };
}

/**
 * 热力图组件 - 使用ECharts实现
 * 适用于展示二维数据的密度和分布
 */
export const HeatmapChartComponent = ({
  data = [],
  dataSource = [],
  bindData,
  width = '100%',
  height = 400,
  xAxis = { type: 'category' },
  yAxis = { type: 'category' },
  colors = [
    '#313695',
    '#4575b4',
    '#74add1',
    '#abd9e9',
    '#e0f3f8',
    '#ffffbf',
    '#fee090',
    '#fdae61',
    '#f46d43',
    '#d73027',
    '#a50026',
  ],
  className,
  title,
  showLegend = true,
  visualMap = {
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
  },
  showTooltip = true,
  label = {
    show: false,
  },
}: HeatmapChartProps) => {
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
    if (bindData && bindData.type === 'JSExpression') {
      try {
        // 在实际渲染器中，这里会由渲染引擎计算表达式
        const contextData = (window as any).__RENDER_CONTEXT__?.[
          bindData.value
        ];
        if (Array.isArray(contextData) && contextData.length > 0) {
          return contextData;
        }
      } catch (e) {
        console.error('计算热力图数据失败:', e);
      }
    }

    // 返回空数组，不提供静态数据
    return [];
  }, [dataSource, data, bindData]);

  // 处理热力图数据和轴
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        data: [],
        xAxisData: [],
        yAxisData: [],
        min: 0,
        max: 0,
      };
    }

    // 检查数据格式，热力图数据通常为 [x, y, value] 格式
    const formattedData = chartData;

    // 提取唯一的x和y值
    const xSet = new Set();
    const ySet = new Set();

    // 如果没有提供x和y轴数据，从数据中提取
    if (!xAxis.data?.length || !yAxis.data?.length) {
      chartData.forEach((item) => {
        if (Array.isArray(item) && item.length >= 3) {
          xSet.add(item[0]);
          ySet.add(item[1]);
        } else if (item.x !== undefined && item.y !== undefined) {
          xSet.add(item.x);
          ySet.add(item.y);
        }
      });
    }

    // 使用提供的数据或从数据中提取的值
    const xAxisData = xAxis.data?.length
      ? xAxis.data
      : (Array.from(xSet) as string[]);
    const yAxisData = yAxis.data?.length
      ? yAxis.data
      : (Array.from(ySet) as string[]);

    // 计算数据范围，用于视觉映射
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    chartData.forEach((item) => {
      let value: number | undefined;
      if (Array.isArray(item) && item.length >= 3) {
        value = item[2];
      } else if (item.value !== undefined) {
        value = item.value;
      }

      if (value !== undefined) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });

    // 如果极值计算失败，使用默认值
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 100;
    }

    return {
      data: formattedData,
      xAxisData,
      yAxisData,
      min,
      max,
    };
  }, [chartData, xAxis.data, yAxis.data]);

  // 监听窗口大小变化，重新渲染图表
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const echartsInstance = chartRef.current.getEchartsInstance();
        echartsInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // 组件挂载后立即调整大小
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 生成ECharts配置
  const getOption = useMemo(() => {
    if (processedData.data.length === 0) {
      return {
        title: {
          text: title || '暂无数据',
          left: 'center',
        },
      };
    }

    // 设置视觉映射范围
    const visualMapConfig = {
      min: visualMap.min !== undefined ? visualMap.min : processedData.min,
      max: visualMap.max !== undefined ? visualMap.max : processedData.max,
      calculable:
        visualMap.calculable !== undefined ? visualMap.calculable : true,
      orient: visualMap.orient || 'horizontal',
      left: visualMap.left || 'center',
      bottom: visualMap.bottom || '5%',
      inRange: {
        color: visualMap.inRange?.color || colors,
      },
    };

    // 设置热力图配置
    return {
      title: title
        ? {
            text: title,
            left: 'center',
          }
        : undefined,
      tooltip: showTooltip
        ? {
            position: 'top',
            formatter: (params: any) => {
              const value = params.value;
              if (Array.isArray(value)) {
                return `${value[0]}, ${value[1]}: ${value[2]}`;
              }
              return `${params.name}: ${value}`;
            },
          }
        : undefined,
      grid: {
        top: '10%',
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: xAxis.type || 'category',
        name: xAxis.name,
        data: processedData.xAxisData,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: yAxis.type || 'category',
        name: yAxis.name,
        data: processedData.yAxisData,
        splitArea: {
          show: true,
        },
      },
      visualMap: visualMapConfig,
      series: [
        {
          name: title || '热力图',
          type: 'heatmap',
          data: processedData.data,
          label: label,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [
    processedData,
    title,
    showTooltip,
    xAxis,
    yAxis,
    visualMap,
    colors,
    label,
  ]);

  return (
    <div className={className}>
      <ReactEcharts
        ref={chartRef}
        option={getOption}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
        }}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
      />
    </div>
  );
};
