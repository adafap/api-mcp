import type { IProperty } from '@/types/data-source';
import type { IDTOSchema } from '@/types/swagger';
import { DtoStrategy } from './dto';

export default class NumberDtoStrategy extends DtoStrategy {
  handleDto(dto: IDTOSchema): {
    [key: string]: IProperty;
  } {
    if (dto.type !== 'number' && dto.type !== 'integer') return {};

    const numberDto: {
      [key: string]: IProperty;
    } = {
      [dto.title || 'value']: {
        type: 'number',
        description: dto.description,
        title: dto.title,
        format: dto.format,
        apifox: dto.apifox,
        ada: dto.ada,
      },
    };

    return numberDto;
  }
}
