import { Textarea } from '@/components/ui/textarea';
import { forwardRef, useMemo } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * 文本域组件封装
 * 支持所有原生textarea属性，如placeholder、rows、disabled等
 * 支持从渲染器上下文获取值
 */
export const TextareaComponent = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<'textarea'> & {
    bindValue?: { type: 'JSExpression'; value: string };
    bindChange?: { type: 'JSExpression'; value: string };
  }
>(({ bindValue, bindChange, ...props }, ref) => {
  // 从上下文计算实际值
  const contextValue = useMemo(() => {
    if (bindValue && bindValue.type === 'JSExpression') {
      try {
        // 在实际渲染器中，这里会由渲染引擎计算表达式
        return (window as any).__RENDER_CONTEXT__?.[bindValue.value];
      } catch (e) {
        console.error('计算绑定值失败:', e);
      }
    }
    return undefined;
  }, [bindValue]);

  // 处理值变更
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (bindChange && bindChange.type === 'JSExpression') {
      try {
        // 在实际渲染器中，这里会由渲染引擎处理表达式
        const fn = (window as any).__RENDER_CONTEXT__?.[bindChange.value];
        if (typeof fn === 'function') {
          fn(e.target.value);
        }
      } catch (e) {
        console.error('执行绑定函数失败:', e);
      }
    }

    // 调用原始onChange
    props.onChange?.(e);
  };

  return (
    <Textarea
      ref={ref}
      {...props}
      value={contextValue !== undefined ? contextValue : props.value}
      onChange={handleChange}
    />
  );
});

TextareaComponent.displayName = 'TextareaComponent';
