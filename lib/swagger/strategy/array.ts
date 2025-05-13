import type { IProperty } from '@/types/data-source';
import type { IDTOSchema } from '@/types/swagger';
import { DtoStrategy } from './dto';
import _ from 'lodash';
import ResponseHandler from '..';

export default class ArrayDtoStrategy extends DtoStrategy {
  handleDto(
    dto: IDTOSchema,
    callBack?: (dto: { [key: string]: IProperty }) => void,
  ): {
    [key: string]: IProperty;
  } {
    if (dto.type !== 'array') return {};

    // 处理数组项定义不存在的情况
    if (!dto.items) {
      return {
        items: { type: 'object', description: '未知数组项类型' },
      };
    }

    // 处理项目引用
    let itemsSchema = dto.items;
    if (itemsSchema.$ref) {
      const resolvedRef = this.handleRef(itemsSchema.$ref);
      if (resolvedRef) {
        itemsSchema = { ...resolvedRef, ..._.omit(itemsSchema, ['$ref']) };
      }
    }

    // 创建数组类型属性
    const result: { [key: string]: IProperty } = {};

    // 处理项目类型
    result.items = new ResponseHandler(this.swagger).converDto2Property(
      itemsSchema,
    );

    // 处理数组特有属性
    if (dto.minItems !== undefined) {
      result.minItems = { type: 'number', value: dto.minItems };
    }

    if (dto.maxItems !== undefined) {
      result.maxItems = { type: 'number', value: dto.maxItems };
    }

    if (dto.uniqueItems) {
      result.uniqueItems = { type: 'boolean', value: true };
    }

    // 如果需要，执行回调处理项目类型
    if (callBack && result.items) {
      // 包装items为所需的格式
      const wrappedItems: { [key: string]: IProperty } = {
        item: result.items as IProperty,
      };
      callBack(wrappedItems);
    }

    return result;
  }
}
