import type { IProperty } from '@/types/data-source';
import type { IDTOSchema, IPropertySchema } from '@/types/swagger';
import { DtoStrategy } from './dto';
import ResponseHandler from '..';

export default class AllOfDtoStrategy extends DtoStrategy {
  handleDto(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): { [key: string]: IProperty } {
    // 合并allOf中的所有模式
    if (dto.allOf && Array.isArray(dto.allOf) && dto.allOf.length > 0) {
      return this.processAllOf(dto, callBack);
    }

    // 处理oneOf情况 - 这里采用第一个作为代表
    if (dto.oneOf && Array.isArray(dto.oneOf) && dto.oneOf.length > 0) {
      return this.processOneOf(dto, callBack);
    }

    // 处理anyOf情况 - 这里将所有可能性合并
    if (dto.anyOf && Array.isArray(dto.anyOf) && dto.anyOf.length > 0) {
      return this.processAnyOf(dto, callBack);
    }

    // 如果没有任何组合类型，尝试作为普通对象处理
    if (dto.properties) {
      const objectStrategy = new ResponseHandler(this.swagger).getDtoStrategy({
        type: 'object',
      });
      return objectStrategy.handleDto(dto, callBack);
    }

    // 最后尝试处理单一$ref引用
    if (dto.$ref) {
      const refSchema = this.handleRef(dto.$ref);
      if (refSchema) {
        const handler = new ResponseHandler(this.swagger);
        if (refSchema.type) {
          const strategy = handler.getDtoStrategy(refSchema as IDTOSchema);
          return strategy.handleDto(refSchema as IDTOSchema, callBack);
        } else {
          return handler.converDto2Property(refSchema, callBack);
        }
      }
    }

    return {};
  }

  /**
   * 处理allOf - 合并所有模式
   */
  private processAllOf(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): { [key: string]: IProperty } {
    // 合并所有模式
    const mergedSchema: IDTOSchema = {
      type: 'object',
      properties: {},
      required: [],
    };

    // 保留原始dto中的其他属性
    Object.keys(dto).forEach((key) => {
      if (key !== 'allOf') {
        mergedSchema[key] = dto[key];
      }
    });

    // 确保allOf存在且是数组
    if (!dto.allOf || !Array.isArray(dto.allOf)) {
      return {};
    }

    // 合并allOf中的每个模式
    dto.allOf.forEach((schema) => {
      let resolvedSchema: IPropertySchema | undefined;

      // 处理$ref引用
      if (schema.$ref) {
        resolvedSchema = this.handleRef(schema.$ref);
      } else {
        resolvedSchema = schema as IPropertySchema;
      }

      if (!resolvedSchema) return;

      // 合并属性
      if (resolvedSchema.properties) {
        mergedSchema.properties = {
          ...mergedSchema.properties,
          ...resolvedSchema.properties,
        };
      }

      // 合并必需字段
      if (resolvedSchema.required && Array.isArray(resolvedSchema.required)) {
        mergedSchema.required = [
          ...(mergedSchema.required || []),
          ...resolvedSchema.required,
        ];
      }
    });

    // 使用对象策略处理合并后的模式
    const objectStrategy = new ResponseHandler(this.swagger).getDtoStrategy({
      type: 'object',
    });
    return objectStrategy.handleDto(mergedSchema, callBack);
  }

  /**
   * 处理oneOf - 使用第一个模式作为代表
   */
  private processOneOf(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): { [key: string]: IProperty } {
    if (!dto.oneOf || !Array.isArray(dto.oneOf) || dto.oneOf.length === 0)
      return {};

    // 使用第一个模式作为代表
    const firstSchema = dto.oneOf[0];
    let resolvedSchema: IPropertySchema | undefined;

    // 处理$ref引用
    if (firstSchema.$ref) {
      resolvedSchema = this.handleRef(firstSchema.$ref);
    } else {
      resolvedSchema = firstSchema as IPropertySchema;
    }

    if (!resolvedSchema) return {};

    // 使用适当的策略处理模式
    const handler = new ResponseHandler(this.swagger);
    if (resolvedSchema.type) {
      const strategy = handler.getDtoStrategy(resolvedSchema as IDTOSchema);
      return strategy.handleDto(resolvedSchema as IDTOSchema, callBack);
    } else {
      return handler.converDto2Property(resolvedSchema, callBack);
    }
  }

  /**
   * 处理anyOf - 合并所有可能性
   */
  private processAnyOf(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): { [key: string]: IProperty } {
    if (!dto.anyOf || !Array.isArray(dto.anyOf) || dto.anyOf.length === 0)
      return {};

    // 合并所有模式，类似于allOf的处理
    const mergedSchema: IDTOSchema = {
      type: 'object',
      properties: {},
    };

    // 保留原始dto中的其他属性
    Object.keys(dto).forEach((key) => {
      if (key !== 'anyOf') {
        mergedSchema[key] = dto[key];
      }
    });

    // 合并anyOf中的每个模式的属性
    dto.anyOf.forEach((schema) => {
      let resolvedSchema: IPropertySchema | undefined;

      // 处理$ref引用
      if (schema.$ref) {
        resolvedSchema = this.handleRef(schema.$ref);
      } else {
        resolvedSchema = schema as IPropertySchema;
      }

      if (!resolvedSchema) return;

      // 合并属性
      if (resolvedSchema.properties) {
        mergedSchema.properties = {
          ...mergedSchema.properties,
          ...resolvedSchema.properties,
        };
      }
    });

    // 使用对象策略处理合并后的模式
    const objectStrategy = new ResponseHandler(this.swagger).getDtoStrategy({
      type: 'object',
    });
    return objectStrategy.handleDto(mergedSchema, callBack);
  }
}
