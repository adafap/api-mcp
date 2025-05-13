/**
 * 错误处理管理器
 */

import type { ErrorContext, ErrorResponse, ErrorStrategy } from './types';

export class ErrorManager {
  private strategies: ErrorStrategy[] = [];

  constructor(strategies: ErrorStrategy[] = []) {
    this.strategies = strategies;
  }

  /**
   * 注册错误处理策略
   */
  registerStrategy(strategy: ErrorStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * 处理错误
   */
  handleError(context: ErrorContext): ErrorResponse {
    // 查找匹配的策略
    for (const strategy of this.strategies) {
      if (strategy.canHandle(context)) {
        return strategy.handle(context);
      }
    }

    // 无匹配策略，使用默认响应
    return {
      success: false,
      error: true,
      message: context.error.message || '未知错误',
      code: 'UNKNOWN_ERROR',
    };
  }
}
