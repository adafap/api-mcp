import type {
  IPublicTypeNodeSchema,
  IPublicTypeRootSchema,
} from '@alilc/lowcode-types';
import type { IDataSource, IProperty } from './data-source';

export interface IFormatStrategy {
  generateSchema(
    property: IProperty,
    options?: {
      currentRootSchema?: IPublicTypeRootSchema;
      currentDatasource?: IDataSource;
      recordName?: string;
    },
  ): IPublicTypeNodeSchema | undefined;
}

export class FormatStrategy implements IFormatStrategy {
  generateSchema(
    property: IProperty,
    options?: {
      currentRootSchema?: IPublicTypeRootSchema;
      currentDatasource?: IDataSource;
      recordName?: string;
    },
  ): IPublicTypeNodeSchema | undefined {
    throw new Error('Method not implemented.');
  }
}

export interface IColumnTempProps {
  data: IProperty;
  key: string;
  valueType?: string;
  renderTag?: boolean;
  valueEnum?: Record<string, unknown>;
  options?: { key: string; label: string; value: string }[];
  handleFuncName?: string;
}

/**
 * 引用对象定义
 * type: 关联关系. 1对1, 1对多
 * key: 唯一值,可能是 _id 也可能是 其他唯一值. 用于查找到确定的关联对象
 * attr: 展示出来的字段名
 * findOne: 单挑记录请求的接口id
 * findAll: 筛选栏定义的列表接口
 * format: 数据处理方式
 */
export interface IRefObject {
  type?: 'single' | 'multi';
  key?: string;
  attr?: string;
  ref?: string;
  findAll?: string;
  findOne?: string;
  format?: string;
  [key: string]: unknown;
}
