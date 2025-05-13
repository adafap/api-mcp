import type { types } from '@/lib/render';

/**
 * 可视化组件示例Schema
 * 用于在渲染器中展示各种图表组件
 */
export const visualizationsSchema: types.Schema = {
  componentName: 'Page',
  props: {
    style: {
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '8px',
    },
  },
  // 在Schema中定义状态，包括各类图表的演示数据
  state: {
    // 雷达图数据
    radarData: [
      [90, 80, 70, 85, 90],
      [70, 65, 80, 75, 60],
    ],
    radarIndicators: [
      { name: '销售', max: 100 },
      { name: '管理', max: 100 },
      { name: '技术', max: 100 },
      { name: '客服', max: 100 },
      { name: '发展', max: 100 },
    ],

    // 散点图数据
    scatterData: [
      { x: 10, y: 8.04 },
      { x: 8, y: 6.95 },
      { x: 13, y: 7.58 },
      { x: 9, y: 8.81 },
      { x: 11, y: 8.33 },
      { x: 14, y: 9.96 },
      { x: 6, y: 7.24 },
      { x: 4, y: 4.26 },
      { x: 12, y: 10.84 },
      { x: 7, y: 4.82 },
      { x: 5, y: 5.68 },
    ],

    // 热力图数据
    heatmapData: [
      [0, 0, 5],
      [0, 1, 7],
      [0, 2, 3],
      [0, 3, 9],
      [0, 4, 2],
      [1, 0, 8],
      [1, 1, 3],
      [1, 2, 6],
      [1, 3, 1],
      [1, 4, 4],
      [2, 0, 9],
      [2, 1, 5],
      [2, 2, 10],
      [2, 3, 7],
      [2, 4, 2],
      [3, 0, 6],
      [3, 1, 8],
      [3, 2, 4],
      [3, 3, 9],
      [3, 4, 5],
    ],
    heatmapXAxis: ['A', 'B', 'C', 'D', 'E'],
    heatmapYAxis: ['一', '二', '三', '四'],

    // 漏斗图数据
    funnelData: [
      { name: '访问', value: 1200 },
      { name: '点击', value: 800 },
      { name: '咨询', value: 600 },
      { name: '订单', value: 300 },
      { name: '完成', value: 100 },
    ],

    // 仪表盘数据
    gaugeValue: 72.5,

    // 普通图表数据
    chartData: [
      { name: '一月', value: 400, users: 250 },
      { name: '二月', value: 300, users: 220 },
      { name: '三月', value: 500, users: 320 },
      { name: '四月', value: 280, users: 200 },
      { name: '五月', value: 590, users: 380 },
      { name: '六月', value: 430, users: 280 },
    ],
  },
  children: [
    {
      componentName: 'h1',
      props: { className: 'text-2xl font-bold mb-6' },
      children: '可视化组件展示',
    },

    // 雷达图部分
    {
      componentName: 'div',
      props: { className: 'mb-8', id: 'radar-section' },
      children: [
        {
          componentName: 'h2',
          props: { className: 'text-xl font-semibold mb-4' },
          children: '雷达图',
        },
        {
          componentName: 'div',
          props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
          children: [
            {
              componentName: 'RadarChartComponent',
              props: {
                title: '部门能力分析',
                dataSource: {
                  type: 'JSExpression',
                  value: 'this.state.radarData',
                },
                indicators: {
                  type: 'JSExpression',
                  value: 'this.state.radarIndicators',
                },
                seriesNames: ['部门A', '部门B'],
                height: 400,
                areaStyle: true,
              },
            },
          ],
        },
      ],
    },

    // 散点图部分
    {
      componentName: 'div',
      props: { className: 'mb-8', id: 'scatter-section' },
      children: [
        {
          componentName: 'h2',
          props: { className: 'text-xl font-semibold mb-4' },
          children: '散点图',
        },
        {
          componentName: 'div',
          props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
          children: [
            {
              componentName: 'ScatterChartComponent',
              props: {
                title: '样本分布',
                dataSource: {
                  type: 'JSExpression',
                  value: 'this.state.scatterData',
                },
                xAxis: {
                  name: 'X轴',
                  min: 0,
                  max: 15,
                },
                yAxis: {
                  name: 'Y轴',
                  min: 0,
                  max: 12,
                },
                height: 400,
                symbolSize: 12,
                series: [{ name: '样本点', xField: 'x', yField: 'y' }],
              },
            },
          ],
        },
      ],
    },

    // 热力图部分
    {
      componentName: 'div',
      props: { className: 'mb-8', id: 'heatmap-section' },
      children: [
        {
          componentName: 'h2',
          props: { className: 'text-xl font-semibold mb-4' },
          children: '热力图',
        },
        {
          componentName: 'div',
          props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
          children: [
            {
              componentName: 'HeatmapChartComponent',
              props: {
                title: '矩阵热力分布',
                dataSource: {
                  type: 'JSExpression',
                  value: 'this.state.heatmapData',
                },
                xAxis: {
                  name: '列',
                  data: {
                    type: 'JSExpression',
                    value: 'this.state.heatmapXAxis',
                  },
                },
                yAxis: {
                  name: '行',
                  data: {
                    type: 'JSExpression',
                    value: 'this.state.heatmapYAxis',
                  },
                },
                height: 400,
                visualMap: {
                  min: 1,
                  max: 10,
                  calculable: true,
                },
              },
            },
          ],
        },
      ],
    },

    // 漏斗图和仪表盘并排
    {
      componentName: 'div',
      props: { className: 'mb-8', id: 'funnel-gauge-section' },
      children: [
        {
          componentName: 'h2',
          props: { className: 'text-xl font-semibold mb-4' },
          children: '漏斗图和仪表盘',
        },
        {
          componentName: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          children: [
            // 漏斗图
            {
              componentName: 'div',
              props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
              children: [
                {
                  componentName: 'FunnelChartComponent',
                  props: {
                    title: '转化漏斗',
                    dataSource: {
                      type: 'JSExpression',
                      value: 'this.state.funnelData',
                    },
                    height: 400,
                    sort: 'descending',
                    nameKey: 'name',
                    valueKey: 'value',
                  },
                },
              ],
            },
            // 仪表盘
            {
              componentName: 'div',
              props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
              children: [
                {
                  componentName: 'GaugeChartComponent',
                  props: {
                    title: '业绩完成度',
                    dataSource: {
                      type: 'JSExpression',
                      value: 'this.state.gaugeValue',
                    },
                    subTitle: '完成率',
                    height: 400,
                    min: 0,
                    max: 100,
                    valueSuffix: '%',
                    axisLine: {
                      lineStyle: {
                        width: 10,
                        color: [
                          [0.3, '#ee6666'],
                          [0.7, '#fac858'],
                          [1, '#91cc75'],
                        ],
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // 普通图表部分
    {
      componentName: 'div',
      props: { className: 'mb-8', id: 'basic-charts-section' },
      children: [
        {
          componentName: 'h2',
          props: { className: 'text-xl font-semibold mb-4' },
          children: '基础图表',
        },
        {
          componentName: 'div',
          props: { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          children: [
            // 折线图
            {
              componentName: 'div',
              props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
              children: [
                {
                  componentName: 'ChartComponent',
                  props: {
                    title: '折线图示例',
                    type: 'line',
                    dataSource: {
                      type: 'JSExpression',
                      value: 'this.state.chartData',
                    },
                    xDataKey: 'name',
                    yDataKey: ['value', 'users'],
                    height: 300,
                  },
                },
              ],
            },
            // 柱状图
            {
              componentName: 'div',
              props: { className: 'bg-white p-6 rounded-lg shadow-sm' },
              children: [
                {
                  componentName: 'ChartComponent',
                  props: {
                    title: '柱状图示例',
                    type: 'bar',
                    dataSource: {
                      type: 'JSExpression',
                      value: 'this.state.chartData',
                    },
                    xDataKey: 'name',
                    yDataKey: ['value', 'users'],
                    height: 300,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
