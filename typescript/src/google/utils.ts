/**
 * Check if type of schema is object or nullable object or property `properties` is defined
 * @param schema JSON schema
 * @returns true if type is object or nullable object or property `properties` is defined
 */
export function isObject(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  if (nullableOr('object', schema.type)) {
    return true;
  }
  if ('properties' in schema) {
    return true;
  }

  return false;
}

/**
 * Check if type of schema is array or nullable array or property `items` is defined
 * @param schema JSON schema
 * @returns true if type is array or nullable array or property `items` is defined
 */
export function isArray(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }

  if (nullableOr('array', schema.type)) {
    return true;
  }
  if ('items' in schema) {
    return true;
  }

  return false;
}

/**
 * Check if type of schema is integer or nullable integer
 * @param schema JSON schema
 * @returns true if type is integer
 */
export function isInteger(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  return nullableOr('integer', schema.type);
}

/**
 * Check if type of schema is boolean or nullable boolean
 * @param schema JSON schema
 * @returns true if type is boolean
 */
export function isBoolean(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  return nullableOr('boolean', schema.type);
}

/**
 * Check if type of schema is number or nullable number
 * @param schema JSON schema
 * @returns true if type is number
 */
export function isNumber(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  return nullableOr('number', schema.type);
}

/**
 * Check if type of schema is string or nullable string
 * @param schema JSON schema
 * @returns true if type is string
 */
export function isString(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  return nullableOr('string', schema.type);
}

/**
 * Check if type of schema is nullable
 * @param schema JSON schema
 * @returns true if type is nullable
 */
export function isNullable(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('type' in schema)) {
    return false;
  }
  if (schema.type === 'null') {
    return true;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.includes('null');
  }

  return false;
}

function nullableOr(type: string, schemaType: unknown): boolean {
  if (schemaType === type) {
    return true;
  }

  if (Array.isArray(schemaType)) {
    if ((schemaType.length === 2 && schemaType.includes('null')) || schemaType.length === 1) {
      return schemaType.includes(type);
    }
  }
  return false;
}

/**
 * Check if type of schema is enum
 * @param schema JSON schema
 * @returns true if type is enum
 */
export function isEnum(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('enum' in schema)) {
    return false;
  }

  return Array.isArray(schema.enum)
}

/**
 * Check if type of schema is oneOf
 * @param schema JSON schema
 * @returns true if type is oneOf
 */
export function isOneOf(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('oneOf' in schema)) {
    return false;
  }

  return Array.isArray(schema.oneOf)
}

/**
 * Check if type of schema is allOf
 * @param schema JSON schema
 * @returns true if type is allOf
 */
export function isAllOf(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('allOf' in schema)) {
    return false;
  }

  return Array.isArray(schema.allOf)
}

/**
 * Check if type of schema is anyOf
 * @param schema JSON schema
 * @returns true if type is anyOf
 */
export function isAnyOf(schema?: unknown): boolean {
  if (!schema || typeof schema !== 'object' || schema === null || !('anyOf' in schema)) {
    return false;
  }

  return Array.isArray(schema.anyOf)
}
