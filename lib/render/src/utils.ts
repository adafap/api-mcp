/**
 * 深度比较两个对象是否相等
 * 此函数执行全面的深度比较，可处理基本类型、数组、对象、日期和正则表达式等
 *
 * @param obj1 要比较的第一个值
 * @param obj2 要比较的第二个值
 * @returns 两个值是否深度相等
 */
export function isEqual(obj1: any, obj2: any): boolean {
  // 快速判断：引用相同或值相等
  if (obj1 === obj2) return true;

  // 处理 null 或 undefined 的情况
  if (obj1 == null || obj2 == null) return false;

  // 类型不同，直接返回 false
  if (typeof obj1 !== typeof obj2) return false;

  // 处理基本类型（字符串、数字、布尔值）
  if (typeof obj1 !== 'object') return obj1 === obj2;

  // 处理日期类型
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // 处理正则表达式
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() === obj2.toString();
  }

  // 处理数组类型
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // 长度不同，直接返回 false
    if (obj1.length !== obj2.length) return false;

    // 递归比较数组中的每个元素
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) return false;
    }

    return true;
  }

  // 确保都是普通对象类型且非 null
  if (!isObject(obj1) || !isObject(obj2)) return false;

  // 比较对象的属性数量
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  // 检查 obj2 是否包含 obj1 的所有属性
  if (!keys1.every((key) => Object.prototype.hasOwnProperty.call(obj2, key)))
    return false;

  // 递归比较每个属性的值
  return keys1.every((key) => isEqual(obj1[key], obj2[key]));
}

/**
 * 检查值是否为普通对象类型
 * @param obj 要检查的值
 * @returns 是否为对象类型
 */
function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * 安全卸载React组件
 * @param root React根节点
 */
export function safeUnmount(root: any): () => void {
  // 标记正在卸载
  let isUnmounting = true;

  // 使用setTimeout异步卸载，避免在渲染过程中卸载导致的冲突
  setTimeout(() => {
    if (isUnmounting && root) {
      try {
        root.unmount();
      } catch (error) {
        console.error('卸载组件时出错:', error);
      } finally {
        isUnmounting = false;
      }
    }
  }, 0);

  // 提供取消卸载的能力
  return () => {
    isUnmounting = false;
  };
}

/**
 * 处理国际化文本
 * @param key 国际化键
 * @param locale 当前语言
 * @param messages 国际化消息
 * @returns 国际化文本
 */
export function getI18nText(
  key: string,
  locale?: string,
  messages?: Record<string, Record<string, string>>,
): string {
  if (!key || !locale || !messages) return key;

  const localeMessages = messages[locale];
  if (!localeMessages) return key;

  return localeMessages[key] || key;
}

/**
 * 处理条件类名
 * @param classNameObj 类名对象
 * @param context 上下文
 * @returns 类名字符串
 */
export function processClassNames(
  classNameObj: Record<string, any>,
  context: any,
): string {
  const classNames: string[] = [];

  // 处理条件类名对象，例如 { 'btn': true, 'btn-primary': this.state.isPrimary }
  Object.entries(classNameObj).forEach(([className, condition]) => {
    // 如果条件是函数，则执行函数
    const conditionValue =
      typeof condition === 'function' ? condition.call(context) : condition;

    if (conditionValue) {
      classNames.push(className);
    }
  });

  return classNames.join(' ');
}
