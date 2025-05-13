import React from 'react';
import type {
  Schema,
  RenderContext,
  ComponentsMap,
  JSExpression,
} from './types';
import { processValue } from './expression';
import { processClassNames, getI18nText } from './utils';

// 最大递归深度限制，防止无限递归
const MAX_RENDER_DEPTH = 50;

// 错误提示组件
const RenderDepthError = React.memo(() => (
  <div style={{ color: 'red' }}>渲染深度超过限制，已中断渲染</div>
));

RenderDepthError.displayName = 'RenderDepthError';

// 渲染错误组件
const RenderError = React.memo(({ error }: { error: any }) => (
  <div style={{ color: 'red', padding: '4px', border: '1px solid red' }}>
    渲染错误: {(error as Error)?.message || String(error)}
  </div>
));

RenderError.displayName = 'RenderError';

// 缓存组件props处理结果以提高性能
const propsCache = new WeakMap<Record<string, any>, Record<string, any>>();

/**
 * 处理组件属性
 * @param props 原始属性对象
 * @param context 渲染上下文
 * @param thisRequiredInJSE 是否要求使用this访问
 * @param locale 当前语言
 * @param messages 国际化消息
 * @returns 处理后的属性对象
 */
export function processProps(
  props: Record<string, any>,
  context: RenderContext,
  thisRequiredInJSE = true,
  locale?: string,
  messages?: Record<string, Record<string, string>>,
): Record<string, any> {
  // 检查缓存中是否已有处理结果
  const cachedProps = propsCache.get(props);
  if (cachedProps) {
    return cachedProps;
  }

  const result: Record<string, any> = {};

  // 遍历处理每个属性
  Object.entries(props).forEach(([key, value]) => {
    // 特殊处理form事件，确保不会导致页面刷新
    if (key === 'onSubmit') {
      const originalHandler = processValue(value, context, thisRequiredInJSE);
      result[key] = (e: React.FormEvent) => {
        e.preventDefault(); // 阻止默认行为
        if (typeof originalHandler === 'function') {
          // 记录表单提交
          if (context.logger) {
            context.logger.log('form-submit', {
              formData:
                e.currentTarget instanceof HTMLFormElement
                  ? new FormData(e.currentTarget)
                  : undefined,
            });
          }
          originalHandler(e);
        }
      };
    }
    // 特殊处理按钮点击事件，确保不会导致页面刷新
    else if (
      key === 'onClick' &&
      (props.type === 'submit' || props.type === 'button')
    ) {
      const originalHandler = processValue(value, context, thisRequiredInJSE);
      result[key] = (e: React.MouseEvent) => {
        e.preventDefault(); // 阻止默认行为

        // 按钮点击反馈效果
        if (e.currentTarget && e.currentTarget instanceof HTMLElement) {
          const button = e.currentTarget;
          // 添加点击效果
          button.classList.add('clicked');
          // 移除点击效果
          setTimeout(() => button.classList.remove('clicked'), 200);
        }

        if (typeof originalHandler === 'function') {
          originalHandler(e);
        }
      };
    }
    // 确保button的type属性是字符串
    else if (key === 'type' && typeof value === 'boolean') {
      // 如果type是布尔值，转换为字符串
      result[key] = value ? 'button' : 'button';
    }
    // 处理样式对象，支持主题变量
    else if (key === 'style' && value && typeof value === 'object') {
      result[key] = processStyleWithTheme(value, context, thisRequiredInJSE);
    }
    // 处理className，支持条件类名
    else if (key === 'className' && value && typeof value === 'object') {
      result[key] = processClassNames(value, context);
    }
    // 处理国际化文本
    else if (
      key === 'text' &&
      typeof value === 'string' &&
      value.startsWith('$t:') &&
      locale &&
      messages
    ) {
      const textKey = value.slice(3);
      result[key] = getI18nText(textKey, locale, messages);
    }
    // 处理其他属性
    else {
      result[key] = processValue(value, context, thisRequiredInJSE);
    }
  });

  // 缓存处理结果
  propsCache.set(props, result);

  return result;
}

// 缓存处理过的样式对象
const styleCache = new WeakMap<Record<string, any>, Record<string, any>>();

/**
 * 处理样式对象，支持主题变量
 */
function processStyleWithTheme(
  style: Record<string, any>,
  context: RenderContext,
  thisRequiredInJSE = true,
): Record<string, any> {
  // 检查缓存
  const cachedStyle = styleCache.get(style);
  if (cachedStyle) {
    return cachedStyle;
  }

  const result = processValue(style, context, thisRequiredInJSE);

  // 如果上下文中包含主题，应用主题变量
  if (context.theme) {
    Object.entries(result).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('$theme.')) {
        const themeKey = value.replace('$theme.', '');
        const themeValue = context.theme?.[themeKey];
        if (themeValue) {
          result[key] = themeValue;
        }
      }
    });
  }

  // 缓存处理结果
  styleCache.set(style, result);

  return result;
}

// 子元素处理缓存
const childrenCache = new WeakMap<any, React.ReactNode>();

/**
 * 处理子元素
 * @param children 子元素
 * @param context 渲染上下文
 * @param componentsMap 组件映射表
 * @param customCreateElement 自定义createElement函数
 * @param thisRequiredInJSE 是否要求使用this访问
 * @param locale 当前语言
 * @param messages 国际化消息
 * @param notFoundComponent 未找到组件时的替代组件
 * @param depth 当前渲染深度
 * @returns 处理后的子元素
 */
export function processChildren(
  children: Schema['children'],
  context: RenderContext,
  componentsMap: ComponentsMap,
  customCreateElement?: (
    component: any,
    props: any,
    children?: any,
  ) => React.ReactElement,
  thisRequiredInJSE = true,
  locale?: string,
  messages?: Record<string, Record<string, string>>,
  notFoundComponent?: React.ComponentType<any>,
  depth = 0,
): React.ReactNode {
  // 深度检查，防止无限递归
  if (depth > MAX_RENDER_DEPTH) {
    return <RenderDepthError />;
  }

  // 空子元素
  if (children === undefined || children === null) {
    return null;
  }

  // 字符串或数字
  if (typeof children === 'string' || typeof children === 'number') {
    // 处理国际化文本
    if (
      typeof children === 'string' &&
      children.startsWith('$t:') &&
      locale &&
      messages
    ) {
      const textKey = children.slice(3);
      return getI18nText(textKey, locale, messages);
    }
    return children;
  }

  // 检查缓存 - 只对非JSExpression/非数组类型的子元素应用缓存
  if (
    typeof children === 'object' &&
    !((children as JSExpression)?.type === 'JSExpression') &&
    !Array.isArray(children)
  ) {
    const cachedChildren = childrenCache.get(children);
    if (cachedChildren) {
      return cachedChildren;
    }
  }

  // 处理JSExpression
  if (
    children &&
    typeof children === 'object' &&
    (children as JSExpression).type === 'JSExpression'
  ) {
    return processValue(children, context, thisRequiredInJSE);
  }

  // 单个子Schema
  if (!Array.isArray(children)) {
    const result = renderSchema(
      children,
      context,
      componentsMap,
      customCreateElement,
      thisRequiredInJSE,
      locale,
      messages,
      notFoundComponent,
      depth + 1, // 增加深度计数
    );

    // 缓存结果 - 只缓存有效的React元素
    if (React.isValidElement(result)) {
      childrenCache.set(children, result);
    }

    return result;
  }

  // 子元素数组 - 不再使用useMemo，直接处理
  // 这样可以避免hooks调用不一致的问题
  const childrenElements = children.map((child, index) => {
    const element = renderSchema(
      child,
      context,
      componentsMap,
      customCreateElement,
      thisRequiredInJSE,
      locale,
      messages,
      notFoundComponent,
      depth + 1, // 增加深度计数
    );

    // 确保每个元素有唯一的key，提高调和性能
    return React.isValidElement(element)
      ? React.cloneElement(element, {
          key: `${child.componentName || ''}-${index}`,
        })
      : element;
  });

  return childrenElements;
}

// Schema渲染缓存
const schemaCache = new WeakMap<Schema, React.ReactNode>();

/**
 * 渲染Schema为React元素
 * @param schema Schema或原始类型
 * @param context 渲染上下文
 * @param componentsMap 组件映射表
 * @param customCreateElement 自定义createElement函数
 * @param thisRequiredInJSE 是否要求使用this访问
 * @param locale 当前语言
 * @param messages 国际化消息
 * @param notFoundComponent 未找到组件时的替代组件
 * @param depth 当前渲染深度
 * @returns React节点
 */
export function renderSchema(
  schema: Schema | string | number | JSExpression,
  context: RenderContext,
  componentsMap: ComponentsMap,
  customCreateElement?: (
    component: any,
    props: any,
    children?: any,
  ) => React.ReactElement,
  thisRequiredInJSE = true,
  locale?: string,
  messages?: Record<string, Record<string, string>>,
  notFoundComponent?: React.ComponentType<any>,
  depth = 0,
): React.ReactNode {
  // 深度检查，防止无限递归
  if (depth > MAX_RENDER_DEPTH) {
    return <RenderDepthError />;
  }

  // 处理字符串或数字，直接返回
  if (typeof schema === 'string' || typeof schema === 'number') {
    // 处理国际化文本
    if (
      typeof schema === 'string' &&
      schema.startsWith('$t:') &&
      locale &&
      messages
    ) {
      const textKey = schema.slice(3);
      return getI18nText(textKey, locale, messages);
    }
    return schema;
  }

  // 处理JSExpression
  if (
    schema &&
    typeof schema === 'object' &&
    (schema as JSExpression).type === 'JSExpression'
  ) {
    return processValue(schema, context, thisRequiredInJSE);
  }

  // 检查schema缓存 - 注意：这只对完全相同的schema对象有效
  // 因为状态可能会改变，所以只缓存无状态组件或静态内容
  if (
    typeof schema === 'object' &&
    !(schema as Schema).state &&
    !(context.state && Object.keys(context.state).length > 0)
  ) {
    const cachedResult = schemaCache.get(schema as Schema);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    // 获取组件名和属性
    const { componentName, props = {}, children } = schema as Schema;

    // 查找组件
    const Component = componentsMap[componentName];
    if (!Component) {
      return notFoundComponent
        ? React.createElement(notFoundComponent, { componentName })
        : null;
    }

    // 处理属性
    const processedProps = processProps(
      props,
      context,
      thisRequiredInJSE,
      locale,
      messages,
    );

    // 处理子元素
    const processedChildren = processChildren(
      children,
      context,
      componentsMap,
      customCreateElement,
      thisRequiredInJSE,
      locale,
      messages,
      notFoundComponent,
      depth + 1, // 增加深度计数
    );

    // 创建元素 - 根据情况使用自定义或默认的createElement
    let result: React.ReactNode;
    if (customCreateElement) {
      result = customCreateElement(
        Component,
        processedProps,
        processedChildren,
      );
    } else if (typeof Component === 'string') {
      // 处理原生HTML元素
      result = React.createElement(
        Component,
        processedProps,
        processedChildren,
      );
    } else {
      // 处理React组件
      result = React.createElement(
        Component,
        processedProps,
        processedChildren,
      );
    }

    // 缓存无状态组件的渲染结果
    if (
      typeof schema === 'object' &&
      !(schema as Schema).state &&
      !(context.state && Object.keys(context.state).length > 0)
    ) {
      schemaCache.set(schema as Schema, result);
    }

    return result;
  } catch (error) {
    console.error('渲染组件出错:', error, schema);
    return <RenderError error={error} />;
  }
}
