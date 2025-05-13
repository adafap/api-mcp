/**
 * 错误处理策略类型定义
 */

export interface ErrorContext {
  error: any;
  method: string;
  url: string;
  params: Record<string, any>;
  retryCount?: number;
}

export interface ErrorResponse {
  success: false;
  error: true;
  message: string;
  code?: string;
  data?: any;
  shouldRetry?: boolean;
  retryDelay?: number;
}

export interface ErrorStrategy {
  name: string;
  description: string;
  canHandle: (context: ErrorContext) => boolean;
  handle: (context: ErrorContext) => ErrorResponse;
}
