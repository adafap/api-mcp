'use client';

import { useMemo, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';

/**
 * 漏斗图组件类型定义
 */
interface FunnelChartProps {
  data?: any[];
  dataSource?: any[];
  bindData?: { type: 'JSExpression'; value: string };
  width?: number | string;
  height?: number | string;
  sort?: 'ascending' | 'descending' | 'none';
  gap?: number;
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
  className?: string;
  title?: string;
  showLegend?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  orientation?: 'vertical' | 'horizontal';
  align?: 'left' | 'center' | 'right';
  roseType?: boolean;
  max?: number;
  min?: number;
}

/**
 * 漏斗图组件 - 使用ECharts实现
 * 适用于展示业务流程中各个阶段的转化率
 */
export const FunnelChartComponent = ({
  data = [],
  dataSource = [],
  bindData,
  width = '100%',
  height = 400,
  sort = 'descending',
  gap = 2,
  nameKey = 'name',
  valueKey = 'value',
  colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
  className,
  title,
  showLegend = true,
  showLabel = true,
  showTooltip = true,
  orientation = 'vertical',
  align = 'center',
  roseType = false,
  max,
  min,
}: FunnelChartProps) => {
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
        console.error('计算漏斗图数据失败:', e);
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

    window.addEventListener('resize', handleResize);

    // 组件挂载后立即调整大小
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 处理漏斗图数据
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    return chartData.map((item) => {
      if (typeof item === 'object') {
        return {
          name: item[nameKey] || '未命名',
          value: item[valueKey] || 0,
        };
      }
      return item;
    });
  }, [chartData, nameKey, valueKey]);

  // 生成ECharts配置
  const getOption = useMemo(() => {
    if (processedData.length === 0) {
      return {
        title: {
          text: title || '暂无数据',
          left: 'center',
        },
      };
    }

    // 计算数据范围，用于视觉映射
    const values = processedData.map((item) => item.value);
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);

    // 设置漏斗图配置
    return {
      title: title
        ? {
            text: title,
            left: 'center',
            top: 10,
          }
        : undefined,
      tooltip: showTooltip
        ? {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          }
        : undefined,
      legend: showLegend
        ? {
            orient: 'horizontal',
            bottom: 10,
            left: 'center',
            data: processedData.map((item) => item.name),
          }
        : undefined,
      color: colors,
      series: [
        {
          name: title || '漏斗图',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: min !== undefined ? min : dataMin,
          max: max !== undefined ? max : dataMax,
          minSize: '0%',
          maxSize: '100%',
          sort: sort,
          gap: gap,
          label: {
            show: showLabel,
            position: orientation === 'horizontal' ? 'inside' : 'outside',
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: processedData,
          ...(orientation === 'horizontal'
            ? {
                orient: 'horizontal',
                left: 'center',
                top: 50,
                bottom: 50,
                width: '90%',
                height: '60%',
              }
            : {}),
          ...(roseType ? { roseType: true } : {}),
          ...(align !== 'center' ? { funnelAlign: align } : {}),
        },
      ],
    };
  }, [
    processedData,
    title,
    showTooltip,
    showLegend,
    colors,
    sort,
    gap,
    showLabel,
    orientation,
    align,
    roseType,
    min,
    max,
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
