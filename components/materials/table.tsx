import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCallback } from 'react';

/**
 * 基础表格组件
 */
export const TableComponent = ({ children, ...props }: any) => (
  <Table {...props}>{children}</Table>
);

export const TableHeaderComponent = ({ children, ...props }: any) => (
  <TableHeader {...props}>{children}</TableHeader>
);

export const TableBodyComponent = ({ children, ...props }: any) => (
  <TableBody {...props}>{children}</TableBody>
);

export const TableRowComponent = ({ children, ...props }: any) => (
  <TableRow {...props}>{children}</TableRow>
);

export const TableHeadComponent = ({ children, ...props }: any) => (
  <TableHead {...props}>{children}</TableHead>
);

export const TableCellComponent = ({ children, ...props }: any) => (
  <TableCell {...props}>{children}</TableCell>
);

export const TableCaptionComponent = ({ children, ...props }: any) => (
  <TableCaption {...props}>{children}</TableCaption>
);

/**
 * 动态表格组件 - 支持从上下文获取数据
 */
export const DynamicTableComponent = ({
  dataSource = { type: 'JSExpression', value: 'this.state.tableData' },
  columns = { type: 'JSExpression', value: 'this.state.tableColumns' },
  caption,
  ...props
}: any) => {
  // 在渲染器中，dataSource和columns会被自动计算为真实值
  // 这里为了类型安全做一些检查
  const tableData = Array.isArray(dataSource) ? dataSource : [];
  const tableColumns = Array.isArray(columns) ? columns : [];

  // 处理单元格渲染
  const renderCell = useCallback((record: any, column: any) => {
    if (!record || !column) return null;

    const { dataIndex, render } = column;
    const value = record[dataIndex];

    // 如果有自定义渲染函数
    if (typeof render === 'function') {
      return render(value, record);
    }

    // 默认就是显示值
    return value;
  }, []);

  return (
    <Table {...props}>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {tableColumns.map((column: any, index: number) => (
            <TableHead key={column.dataIndex || index}>
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((record: any, rowIndex: number) => (
          <TableRow key={record.key || rowIndex}>
            {tableColumns.map((column: any, colIndex: number) => (
              <TableCell key={column.dataIndex || colIndex}>
                {renderCell(record, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {tableData.length === 0 && (
          <TableRow>
            <TableCell colSpan={tableColumns.length} className="text-center">
              暂无数据
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
