'use client';

// 导出所有物料组件
export * from './card';
export * from './button';
export * from './input';
export * from './textarea';
export * from './table';
export * from './select';
export * from './checkbox';
export * from './switch';
export * from './radio-group';
export * from './label';
export * from './sidebar';
export * from './tabs';
export * from './dialog';
export * from './sheet';
export * from './pagination';
export * from './tooltip';

// 新增数据展示相关组件
export * from './data-table';
export * from './stat-card';
export * from './accordion';

// 导出可视化组件
export * from './visualizations/radar';
export * from './visualizations/scatter';
export * from './visualizations/heatmap';
export * from './visualizations/funnel';
export * from './visualizations/gauge';
export * from './visualizations/pie';
export * from './visualizations/bar';
export * from './visualizations/line';

// 导入所需的组件实现
import { CardComponent } from './card';
import { DataTableComponent } from './data-table';
import { StatCardComponent } from './stat-card';
import { AccordionComponent } from './accordion';
import { TabsComponent } from './tabs';
import { DialogComponent } from './dialog';
import { TooltipComponent } from './tooltip';
import { RadarChartComponent } from './visualizations/radar';
import { ScatterChartComponent } from './visualizations/scatter';
import { HeatmapChartComponent } from './visualizations/heatmap';
import { FunnelChartComponent } from './visualizations/funnel';
import { GaugeChartComponent } from './visualizations/gauge';
import { PieChartComponent } from './visualizations/pie';
import { BarChartComponent } from './visualizations/bar';
import { LineChartComponent } from './visualizations/line';

/**
 * 组件映射表
 * 仅用于客户端渲染，将组件名映射到实际组件实现
 */
export const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // 基础组件
  DataTable: DataTableComponent,
  Card: CardComponent,
  StatCard: StatCardComponent,
  Accordion: AccordionComponent,
  Tabs: TabsComponent,
  Dialog: DialogComponent,
  Tooltip: TooltipComponent,

  // 可视化组件
  RadarChart: RadarChartComponent,
  ScatterChart: ScatterChartComponent,
  HeatmapChart: HeatmapChartComponent,
  FunnelChart: FunnelChartComponent,
  GaugeChart: GaugeChartComponent,
  PieChart: PieChartComponent,
  BarChart: BarChartComponent,
  LineChart: LineChartComponent,
};

/**
 * 生成用于渲染器的组件映射
 * 确保描述中的组件名能正确映射到实际组件实现
 */
export function createRenderComponents() {
  // 基础HTML组件
  const basicComponents = {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  };

  // 合并所有组件
  return {
    ...basicComponents,
    ...COMPONENT_MAP,
  };
}
