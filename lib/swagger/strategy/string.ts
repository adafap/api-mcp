import type { IProperty } from '@/types/data-source';
import type { IDTOSchema } from '@/types/swagger';
import { DtoStrategy } from './dto';

export default class StringDtoStrategy extends DtoStrategy {
  handleDto(dto: IDTOSchema): {
    [key: string]: IProperty;
  } {
    if (dto.type !== 'string') return {};

    const stringDto: {
      [key: string]: IProperty;
    } = {
      [dto.title ?? '']: {
        type: 'string',
        description: dto.description,
        title: dto.title,
        format: dto.format,
        apifox: dto.apifox,
        ada: dto.ada,
      },
    };

    return stringDto;
  }
}
