/**
 * 错误处理策略模块
 */

import { ErrorManager } from './error-manager';
import { AuthErrorStrategy } from './auth-error';
import { ParamErrorStrategy } from './param-error';
import { ServerErrorStrategy } from './server-error';
import { NotFoundErrorStrategy } from './not-found-error';
import { ConnectionErrorStrategy } from './connection-error';
import { DefaultErrorStrategy } from './default-error';

// 导出类型定义
export * from './types';

// 导出错误管理器
export { ErrorManager };

// 导出错误策略
export const strategies = [
  new AuthErrorStrategy(),
  new ParamErrorStrategy(),
  new ServerErrorStrategy(),
  new NotFoundErrorStrategy(),
  new ConnectionErrorStrategy(),
  new DefaultErrorStrategy(),
];
