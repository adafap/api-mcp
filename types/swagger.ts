/**
 * Swagger JSON 根对象
 */
export interface ISwagger {
  openapi: string;
  paths: IPaths;
  info: Info;
  tags: { name: string }[];
  servers: IServer[];
  components: IComponents;
  // Swagger 2.0 特有属性
  basePath?: string;
  host?: string;
  schemes?: string[];
}

/**
 * 路径定义对象
 */
export interface IPaths {
  [path: string]: {
    get?: IOperation;
    post?: IOperation;
    put?: IOperation;
    delete?: IOperation;
    [methodName: string]: IOperation | undefined;
  };
}

/**
 * API 操作定义对象
 */
export interface IOperation {
  operationId: string;
  summary?: string;
  description?: string;
  parameters?: IParameter[];
  requestBody?: IRequestBody;
  responses?: IResponses;
  tags?: string[];
}

/**
 * 参数定义对象
 */
export interface IParameter {
  name: string;
  required: boolean;
  in: string;
  description: string;
  schema: {
    type: string;
    [key: string]: unknown;
  };
  title?: string;
}

/**
 * 请求体定义对象
 */
export interface IRequestBody {
  required: boolean;
  content: {
    [contentType: string]: {
      schema?:
        | {
            $ref?: string;
            type?: string;
          }
        | IDTOSchema;
    };
  };
}

/**
 * 响应定义对象
 */
export interface IResponses {
  [statusCode: string]: {
    description?: string;
    content?: {
      [contentType: string]: {
        schema:
          | {
              $ref: string;
            }
          | IDTOSchema;
      };
    };
  };
}

/**
 * 数据模式定义对象
 */
export interface IDTOSchema {
  type?: string;
  properties?: {
    [propertyName: string]: IPropertySchema;
  };
  required?: string[];
  enum?: any[];
  title?: string;
  items?: IPropertySchema;

  format?: string;
  description?: string;
  $ref?: string;

  allOf?: IPropertySchema[];
  oneOf?: IPropertySchema[];
  anyOf?: IPropertySchema[];

  example?: string;
  [key: string]: unknown;
  apifox?: Record<string, unknown>;
  ada?: {
    search?: boolean;
    [key: string]: unknown;
  };

  // 数组相关属性
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // 附加属性
  additionalProperties?: boolean | IPropertySchema;
}

export interface IPropertySchema {
  title?: string;
  type?: string;
  format?: string;
  description?: string;
  $ref?: string;
  properties?: {
    [propertyName: string]: IPropertySchema;
  };
  allOf?: { $ref?: string }[];
  example?: string;
  [key: string]: unknown;
  apifox?: Record<string, unknown>;
  ada?: {
    search?: boolean;
    [key: string]: unknown;
  };
}

/**
 * API 文档信息对象
 */
export interface Info {
  title: string;
  description: string;
  version: string;
  contact: IContact;
  license: License;
}

/**
 * 联系信息对象
 */
export interface IContact {
  [contactProperty: string]: any;
}

/**
 * 许可证信息对象
 */
export interface License {
  name: string;
  url: string;
}

/**
 * 服务器信息对象
 */
export interface IServer {
  url: string;
  description: string;
}

/**
 * 组件定义对象
 */
export interface IComponents {
  securitySchemes: {
    [securitySchemeName: string]: ISecurityScheme;
  };
  schemas: {
    [schemaName: string]: IDTOSchema;
  };
}

/**
 * 安全方案定义对象
 */
export interface ISecurityScheme {
  scheme: string;
  bearerFormat: string;
  type: string;
}
