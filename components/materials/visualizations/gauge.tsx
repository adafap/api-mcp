'use client';

import { useMemo, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';

/**
 * 仪表盘组件类型定义
 */
interface GaugeChartProps {
  data?: number | { value: number; name?: string };
  dataSource?: number | { value: number; name?: string };
  bindData?: { type: 'JSExpression'; value: string };
  width?: number | string;
  height?: number | string;
  min?: number;
  max?: number;
  splitNumber?: number;
  title?: string;
  subTitle?: string;
  colors?: string[];
  className?: string;
  showProgress?: boolean;
  showPointer?: boolean;
  showAxisLabel?: boolean;
  axisLabelFormatter?: string | ((value: number) => string);
  valueSuffix?: string;
  radius?: string | number;
  center?: [string | number, string | number];
  startAngle?: number;
  endAngle?: number;
  progress?: {
    show?: boolean;
    overlap?: boolean;
    width?: number;
    roundCap?: boolean;
    clip?: boolean;
    itemStyle?: {
      color?: string;
      shadowBlur?: number;
      shadowColor?: string;
    };
  };
  axisLine?: {
    lineStyle?: {
      width?: number;
      color?: Array<[number, string]>;
    };
  };
  axisTick?: {
    distance?: number;
    splitNumber?: number;
    lineStyle?: {
      color?: string;
      width?: number;
      type?: 'solid' | 'dashed' | 'dotted';
    };
  };
  pointer?: {
    show?: boolean;
    length?: string | number;
    width?: number;
    itemStyle?: {
      color?: string;
    };
  };
  animation?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  detail?: {
    valueAnimation?: boolean;
    offsetCenter?: [string | number, string | number];
    formatter?: string | ((value: number) => string);
    fontSize?: number;
  };
}

/**
 * 仪表盘组件 - 使用ECharts实现
 * 适用于展示单个指标的进度或状态
 */
export const GaugeChartComponent = ({
  data,
  dataSource,
  bindData,
  width = '100%',
  height = 400,
  min = 0,
  max = 100,
  splitNumber = 10,
  title,
  subTitle,
  colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
  className,
  showProgress = true,
  showPointer = true,
  showAxisLabel = true,
  axisLabelFormatter,
  valueSuffix = '',
  radius = '75%',
  center = ['50%', '60%'],
  startAngle = 225,
  endAngle = -45,
  progress = {
    show: true,
    width: 10,
    roundCap: true,
    clip: false,
    itemStyle: {
      shadowBlur: 0,
      shadowColor: '#ccc',
    },
  },
  axisLine = {
    lineStyle: {
      width: 10,
      color: [
        [0.25, colors[0]],
        [0.5, colors[1]],
        [0.75, colors[2]],
        [1, colors[3]],
      ],
    },
  },
  axisTick = {
    distance: 0,
    splitNumber: 5,
    lineStyle: {
      color: '#999',
      width: 1,
    },
  },
  pointer = {
    show: true,
    length: '60%',
    width: 6,
    itemStyle: {
      color: 'auto',
    },
  },
  animation = true,
  animationDuration = 1000,
  animationEasing = 'cubicOut',
  detail = {
    valueAnimation: true,
    offsetCenter: [0, '20%'],
    fontSize: 30,
  },
}: GaugeChartProps) => {
  const chartRef = useRef<ReactEcharts>(null);

  // 获取图表数据
  const chartData = useMemo(() => {
    // 优先使用直接传入的dataSource
    if (dataSource !== undefined) {
      return dataSource;
    }

    // 其次使用data属性
    if (data !== undefined) {
      return data;
    }

    // 尝试从渲染器上下文获取数据 (保留兼容性)
    if (bindData && bindData.type === 'JSExpression') {
      try {
        // 在实际渲染器中，这里会由渲染引擎计算表达式
        const contextData = (window as any).__RENDER_CONTEXT__?.[
          bindData.value
        ];
        if (contextData !== undefined) {
          return contextData;
        }
      } catch (e) {
        console.error('计算仪表盘数据失败:', e);
      }
    }

    // 返回默认值
    return 0;
  }, [dataSource, data, bindData]);

  // 处理仪表盘数据
  const processedData = useMemo(() => {
    if (chartData === undefined || chartData === null) {
      return { value: 0, name: subTitle || '' };
    }

    // 如果是数字，直接使用
    if (typeof chartData === 'number') {
      return { value: chartData, name: subTitle || '' };
    }

    // 如果是对象，提取value和name
    if (typeof chartData === 'object' && chartData.value !== undefined) {
      return {
        value: chartData.value,
        name: chartData.name || subTitle || '',
      };
    }

    // 默认返回0
    return { value: 0, name: subTitle || '' };
  }, [chartData, subTitle]);

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
    const detailFormatter =
      detail.formatter || (valueSuffix ? `{value}${valueSuffix}` : '{value}');

    // 设置仪表盘配置
    return {
      title: title
        ? {
            text: title,
            left: 'center',
            top: 10,
          }
        : undefined,
      series: [
        {
          type: 'gauge',
          min,
          max,
          splitNumber,
          radius,
          center,
          startAngle,
          endAngle,
          progress: showProgress
            ? {
                show: progress.show,
                overlap: progress.overlap,
                width: progress.width,
                roundCap: progress.roundCap,
                clip: progress.clip,
                itemStyle: progress.itemStyle,
              }
            : undefined,
          axisLine: {
            lineStyle: axisLine.lineStyle,
          },
          axisTick: {
            show: true,
            distance: axisTick.distance,
            splitNumber: axisTick.splitNumber,
            lineStyle: axisTick.lineStyle,
          },
          axisLabel: {
            show: showAxisLabel,
            distance: 25,
            color: '#999',
            fontSize: 12,
            formatter: axisLabelFormatter,
          },
          pointer: showPointer
            ? {
                show: pointer.show,
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: pointer.length,
                width: pointer.width,
                offsetCenter: [0, 0],
                itemStyle: pointer.itemStyle,
              }
            : { show: false },
          anchor: {
            show: showPointer,
            size: 20,
            showAbove: true,
            itemStyle: {
              borderWidth: 8,
              borderColor: 'auto',
            },
          },
          title: {
            show: !!processedData.name,
            offsetCenter: [0, '70%'],
          },
          detail: {
            valueAnimation: detail.valueAnimation,
            offsetCenter: detail.offsetCenter,
            fontSize: detail.fontSize,
            formatter: detailFormatter,
            color: 'inherit',
          },
          data: [processedData],
          animation,
          animationDuration,
          animationEasing,
        },
      ],
    };
  }, [
    processedData,
    title,
    min,
    max,
    splitNumber,
    radius,
    center,
    startAngle,
    endAngle,
    showProgress,
    progress,
    axisLine,
    axisTick,
    showAxisLabel,
    axisLabelFormatter,
    showPointer,
    pointer,
    detail,
    valueSuffix,
    animation,
    animationDuration,
    animationEasing,
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
