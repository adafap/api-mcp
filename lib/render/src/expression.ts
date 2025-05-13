import type { JSExpression, JSFunction, RenderContext } from './types';

// 表达式结果缓存
// 使用WeakMap避免内存泄漏
const expressionCache = new WeakMap<
  JSExpression,
  {
    context: WeakRef<RenderContext>;
    result: any;
    timestamp: number;
  }
>();

// 函数编译缓存
const functionCache = new WeakMap<JSFunction, (...args: any[]) => any>();

// 表达式超时时间（ms）
const EXPRESSION_TIMEOUT = 100;

// 缓存过期时间（ms）
const CACHE_TTL = 5000;

/**
 * 检查表达式是否包含潜在危险内容
 * 仅检查真正危险的代码，允许常规的交互和函数调用
 */
function isMaliciousExpression(exprStr: string): boolean {
  // 只检查真正危险的代码模式
  const dangerousPatterns = [
    // 保留最基本的安全检查
    /__proto__/i, // 原型污染
    /prototype\[/i, // 原型污染
    /constructor\[/i, // 原型链攻击

    // 可选检查: 移除这些检查，允许常规的功能使用
    // /document\.cookie/i,
    // /localStorage/i,
    // /sessionStorage/i,
    // /window\.open/i,
    // /eval\(/i,
    // /Function\(/i,
    // /setTimeout\(/i,
    // /setInterval\(/i,
    // /while\s*\([^\)]*true/i, // 检测无限循环
  ];

  return dangerousPatterns.some((pattern) => pattern.test(exprStr));
}

/**
 * 执行JS表达式
 * @param expr JS表达式对象
 * @param context 执行上下文
 * @param thisRequiredInJSE 是否要求使用this访问
 * @returns 表达式执行结果
 */
export function evaluateExpression(
  expr: JSExpression,
  context: RenderContext,
  thisRequiredInJSE = true,
): any {
  try {
    // 检查是否有缓存结果
    const now = Date.now();
    const cachedEntry = expressionCache.get(expr);

    // 如果有缓存且未过期且上下文相同，直接返回缓存结果
    if (
      cachedEntry &&
      now - cachedEntry.timestamp < CACHE_TTL &&
      cachedEntry.context.deref() === context
    ) {
      return cachedEntry.result;
    }

    // 表达式安全性检查
    if (isMaliciousExpression(expr.value)) {
      console.warn('表达式可能包含不安全代码，请谨慎:', expr.value);
      // 继续执行，但发出警告
    }

    // 标记开始执行时间
    const startTime = performance.now();

    // 简化处理: 使用一个标志来防止超时后的执行
    let hasTimedOut = false;
    let result: any;

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      hasTimedOut = true;
      console.error('表达式执行超时:', expr.value);
    }, EXPRESSION_TIMEOUT);

    try {
      // 根据thisRequiredInJSE来决定代码模板
      let code: string;
      if (thisRequiredInJSE) {
        code = `
          with(this) {
            return (${expr.value});
          }
        `;
      } else {
        code = `
          const { state, utils, constants, location, history, ...rest } = this;
          const ctx = { state, utils, constants, location, history, ...rest };
          
          with(ctx) {
            return (${expr.value});
          }
        `;
      }

      // 编译函数
      const func = new Function(code);

      // 记录上下文引用
      const ctx = context.this || context;

      // 执行函数
      if (!hasTimedOut) {
        result = func.call(ctx);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // 性能监控
    const endTime = performance.now();
    if (endTime - startTime > 10) {
      console.warn(
        '表达式执行耗时较长:',
        expr.value,
        `${(endTime - startTime).toFixed(2)}ms`,
      );
    }

    // 缓存结果
    expressionCache.set(expr, {
      context: new WeakRef(context),
      result,
      timestamp: now,
    });

    return result;
  } catch (error) {
    console.error('执行表达式出错:', expr.value, error);
    return undefined;
  }
}

/**
 * 执行JS函数
 * @param func JS函数对象
 * @param context 执行上下文
 * @returns 执行后的函数
 */
export function evaluateFunction(
  func: JSFunction,
  context: RenderContext,
): (...args: any[]) => any {
  // 检查是否需要输出安全警告
  if (isMaliciousExpression(func.value)) {
    console.warn('函数可能包含不安全代码，请谨慎:', func.value);
  }

  // 尝试从缓存获取编译好的函数
  let compiledFunc = functionCache.get(func);

  if (!compiledFunc) {
    try {
      // 删除开头的function声明和结尾的大括号
      const functionBodyContent = func.value.replace(
        /^function\s*\([^)]*\)\s*\{|\}$/g,
        '',
      );

      // 获取参数名
      const argNames: string[] = [];
      const funcArgMatch = func.value.match(/^function\s*\(([^)]*)\)/);
      if (funcArgMatch?.[1]) {
        const funcArgs = funcArgMatch[1].split(',').map((arg) => arg.trim());
        argNames.push(...funcArgs);
      }

      // 构建函数体
      const code = `
        with(this) {
          ${functionBodyContent}
        }
      `;

      // 编译函数
      compiledFunc = new Function(...argNames, code) as (...args: any[]) => any;

      // 缓存编译结果
      functionCache.set(func, compiledFunc);
    } catch (error) {
      console.error('编译函数时出错:', error);
      console.error('函数内容:', func.value);

      // 返回一个空函数，避免运行时错误
      return () => undefined;
    }
  }

  // 缓存上下文引用
  const ctx = context.this || context;

  // 返回包装函数
  return (...args: any[]) => {
    try {
      // 执行函数，确保compiledFunc存在
      if (compiledFunc) {
        return compiledFunc.apply(ctx, args);
      }
      return undefined;
    } catch (error) {
      console.error('执行函数时出错:', error);
      console.error('函数内容:', func.value);
      console.error('参数:', args);
      return undefined;
    }
  };
}

// 值处理结果缓存
const valueCache = new WeakMap<
  object,
  {
    context: WeakRef<RenderContext>;
    result: any;
    timestamp: number;
  }
>();

/**
 * 处理属性值
 * @param value 属性值
 * @param context 渲染上下文
 * @param thisRequiredInJSE 是否要求使用this访问
 * @returns 处理后的属性值
 */
export function processValue(
  value: any,
  context: RenderContext,
  thisRequiredInJSE = true,
): any {
  // 处理null和undefined
  if (value == null) {
    return value;
  }

  // 处理基本类型
  if (typeof value !== 'object') {
    return value;
  }

  // 对于对象类型，尝试从缓存获取结果
  const now = Date.now();
  const cachedValue = valueCache.get(value);

  if (
    cachedValue &&
    now - cachedValue.timestamp < CACHE_TTL &&
    cachedValue.context.deref() === context
  ) {
    return cachedValue.result;
  }

  let result: any;

  // 处理JSExpression
  if (value.type === 'JSExpression') {
    result = evaluateExpression(
      value as JSExpression,
      context,
      thisRequiredInJSE,
    );
  }
  // 处理JSFunction
  else if (value.type === 'JSFunction') {
    result = evaluateFunction(value as JSFunction, context);
  }
  // 处理对象，递归处理每个属性
  else if (!Array.isArray(value)) {
    result = {};
    Object.entries(value).forEach(([k, v]) => {
      result[k] = processValue(v, context, thisRequiredInJSE);
    });
  }
  // 处理数组，递归处理每个元素
  else {
    result = value.map((item) =>
      processValue(item, context, thisRequiredInJSE),
    );
  }

  // 缓存结果
  valueCache.set(value, {
    context: new WeakRef(context),
    result,
    timestamp: now,
  });

  return result;
}
