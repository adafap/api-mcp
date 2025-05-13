import type { IDTOSchema, IPropertySchema, ISwagger } from '@/types/swagger';
import type { IProperty } from '@/types/data-source';
import _ from 'lodash';

export interface IDtoStrategy {
  handleDto(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): {
    [key: string]: IProperty;
  };
}

export class DtoStrategy implements IDtoStrategy {
  swagger: ISwagger;
  protected refCache: Map<string, IProperty> = new Map();

  constructor(swagger: ISwagger) {
    this.swagger = swagger;
  }

  handleDto(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): {
    [key: string]: IProperty;
  } {
    throw new Error('Method not implemented.');
  }

  /**
   * 检查并推断属性类型
   */
  checkType(property: IPropertySchema): string {
    // 处理引用或组合类型
    if (
      _.get(property, '$ref') ||
      _.get(property, 'allOf') ||
      _.get(property, 'oneOf') ||
      _.get(property, 'anyOf')
    ) {
      return 'object';
    }

    // 显式指定的类型
    if (property.type) {
      return property.type;
    }

    // 根据属性特征推断类型
    if (property.properties) {
      return 'object';
    }

    if (property.items) {
      return 'array';
    }

    if (property.enum && Array.isArray(property.enum)) {
      // 枚举值根据第一个值的类型推断
      if (property.enum.length > 0) {
        const firstEnum = property.enum[0];
        if (typeof firstEnum === 'number') {
          return 'number';
        }
        if (typeof firstEnum === 'boolean') {
          return 'boolean';
        }
      }
      return 'string';
    }

    // 根据格式推断类型
    if (property.format) {
      switch (property.format) {
        case 'int32':
        case 'int64':
        case 'float':
        case 'double':
        case 'number':
          return 'number';
        case 'byte':
        case 'binary':
        case 'date':
        case 'date-time':
        case 'password':
        case 'email':
        case 'uuid':
          return 'string';
        default:
          // 尝试匹配自定义格式
          if (/^int|^float|^double|^decimal/.test(property.format)) {
            return 'number';
          }
          if (/date|time/.test(property.format)) {
            return 'string';
          }
      }
    }

    // 如果有示例值，根据示例推断
    if (property.example !== undefined) {
      return typeof property.example;
    }

    // 默认为字符串类型
    return 'string';
  }

  /**
   * 处理Schema中的引用($ref)
   */
  protected handleRef(ref: string): IPropertySchema | undefined {
    // 检查缓存
    const cachedRef = this.refCache.get(ref);
    if (cachedRef) {
      return cachedRef as unknown as IPropertySchema;
    }

    // 解析引用路径
    const dtoPath = this.convertRefPathToObjectPath(ref);
    if (!dtoPath) return undefined;

    // 获取引用的模式
    const referencedSchema = _.get(this.swagger, dtoPath);
    if (!referencedSchema) return undefined;

    return referencedSchema;
  }

  /**
   * 将引用路径转换为对象访问路径
   */
  protected convertRefPathToObjectPath(ref: string): string | undefined {
    if (!ref) return undefined;

    // 处理形如 "#/components/schemas/Pet" 的路径
    if (ref.startsWith('#/')) {
      // 移除前导 #/
      const pathWithoutHash = ref.substring(2);
      return pathWithoutHash.replace(/\//g, '.');
    }

    // 处理外部引用或其他格式 (暂不支持)
    return undefined;
  }

  /**
   * 智能从属性中提取标题
   */
  protected extractTitle(
    property: IPropertySchema,
    propertyName: string,
  ): string {
    if (property.title) {
      return property.title;
    }

    if (property.description) {
      // 尝试从描述中提取简短的标题（取第一句或前30个字符）
      const firstSentence = property.description.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length < 50) {
        return firstSentence;
      }
    }

    // 从属性名生成标题（驼峰转空格分隔）
    return propertyName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
