import type { DataSourceOptions } from '@alilc/lowcode-datasource-types';
import type { IRefObject } from './schema';

export interface IPager {
  first_item_on_page?: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
  is_first_page?: boolean;
  is_last_page?: boolean;
  last_item_on_page?: number;
  page_count?: number;
  page_number?: number;
  page_size?: number;
  total_item_count?: number;
}

export interface ICodeResponse {
  type?: string;
  code?: string;
  properties?: {
    [key: string]: IProperty;
  };
  title?: string;
  required?: string[];
}

export interface IProperty {
  title?: string;
  name?: string;
  in?: string;
  default?: string | number | boolean | null;
  description?: string;
  required?: boolean;
  type?: string;
  format?: string;
  items?: {
    [key: string]: IProperty;
  };
  apifox?: Record<string, unknown>;
  ada?: IAdaProperty;
  collectionFormat?: string;
  example?: unknown;
  enum?: unknown[];
  value?: unknown;
  [key: string]: unknown;
}

export interface IAdaProperty {
  ref?: IRefObject;
  root?: boolean;
  component?: {
    name: string;
  };
  column?: {
    search?: boolean;
    sort?: boolean;
    filter?: boolean;
  };
  reaction?: unknown;
  [key: string]: unknown;
}

export interface IParams {
  description?: string;
  name?: string;
  type?: string;
  properties?: {
    [key: string]: IProperty;
  };
  required?: string[];
}

export interface IPage<T> {
  count: number;
  data: T[];
  errcode: number;
  errmsg: string;
  pager: IPager;
}

export interface IRequest {
  query?: { [key: string]: IParams };
  body?: { [key: string]: IParams };
  path?: { [key: string]: IParams };
}

export interface IDataSourceConfig {
  tags?: string[];
  key?: string;
  basePath?: string;
  method?: string;
  params?: IRequest;
  response?: ICodeResponse[];
  title?: string;
  subTitle?: string;
  path?: string;
  responsePath?: string;
  description?: string;
}

export interface IDataSource {
  type?: string;
  isInit?: boolean;
  id?: string;
  options?: DataSourceOptions & { componentName?: string };
  config?: IDataSourceConfig;
}

/**
 * 数据源 schema 对象 
 */
export interface IDataSourceList<T> {
  list: IDataSource[];
}

/**
 * 参数定义接口
 */
export interface IParamDefinition {
  type?: string;
  description?: string;
  required?: boolean;
}
