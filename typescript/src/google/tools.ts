import { ToolListUnion } from "@google/genai"
import Superface from "../client"
import { isAllOf, isAnyOf, isArray, isBoolean, isEnum, isInteger, isNullable, isNumber, isObject, isOneOf, isString } from "./utils";


/**
 * Google supports (26.3.2025) only these open API keywords:
 * - type - must be in Upper Case (STRING, NUMBER, BOOLEAN, INTEGER, ARRAY, OBJECT), can be array of types. Array of types not working in our API
 * - description - but not title
 * - required
 * - properties - must not be empty
 * - items - can be empty
 * - enum - must be used with type STRING
 * - nullable - property not suported by our API - our limitation trying to map nullable from type
 * - format - not supported by our API -- our limitation
 * - enum,
 * - anyOf - not supported by our API -- our limitation. Currently mappig our oneOf to anyOf
 */

/**
 * Convert Superface tools to Google GenAI tools
 * @param tools Superface tools
 * @returns Google GenAI tools
 */
export function convertToGenaiTools(tools: Awaited<ReturnType<Superface["getTools"]>>): ToolListUnion {
  const googleTools: ToolListUnion = []

  for (const tool of tools) {
    googleTools.push({
      functionDeclarations: [
        {
          name: tool.function.name,
          description: tool.function.description,
          parameters: visit(tool.function.parameters)
        }
      ]
    })
  }

  return googleTools;
}

function visit(schema?: Record<string, unknown>): Record<string, unknown> {
  if (!schema) return {};   

  if (isObject(schema)) {
    return visitObject(schema);
  } else if (isEnum(schema)) {
    return visitEnum(schema);
  } else if (isArray(schema)) {
    return visitArray(schema);
  } else if (schema.type === 'null') {
    return {
      nullable: true
    }
  } else if (isString(schema) || isNumber(schema) || isBoolean(schema) || isInteger(schema)) {
    return visitPrimitive(schema);
  } else if (isOneOf(schema)) {
    return visitOneOf(schema);
  } else if (isAllOf(schema)) {
    return visitAllOf(schema);
  } else if (isAnyOf(schema)) {
    return visitAnyOf(schema);
  }

  throw new Error(`Unsupported parameter type: ${JSON.stringify(schema)}`);
}

function visitObject(schema: Record<string, unknown>): { type: 'OBJECT', properties: Record<string, unknown>, required?: string[], description?: string, nullable?: boolean } {
  const resolved: { type: 'OBJECT', properties: Record<string, unknown>, required?: string[], description?: string, nullable?: boolean } = {
    type: 'OBJECT',
    properties: {},
    nullable: isNullable(schema) ? true : undefined
  };

  if (schema.properties && typeof schema.properties === 'object' && schema.properties !== null) {
    const properties = schema.properties as Record<string, unknown>;
    for (const key in properties) {
      if (properties[key] && typeof properties[key] === 'object' && properties[key] !== null) {
        resolved.properties[key] = visit(properties[key] as Record<string, unknown>);
      }
    }
  }

  if (schema.required && Array.isArray(schema.required)) {
    resolved.required = schema.required;
  }

  return { ...resolved, ...getDocumentation(schema) };
}

function visitPrimitive(schema: Record<string, unknown>): { type: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'INTEGER', description?: string, nullable?: boolean } {
  let type: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'INTEGER' = 'STRING';

  if (isBoolean(schema)) {
    type = 'BOOLEAN';
  } else if (isNumber(schema)) {
    type = 'NUMBER';
  } else if (isInteger(schema)) {
    type = 'INTEGER';
  } else if (isString(schema)) {
    type = 'STRING';
  }

  return { type, nullable: isNullable(schema) ? true : undefined, ...getDocumentation(schema) };
}

function visitArray(schema: Record<string, unknown>): { type: 'ARRAY', items: Record<string, unknown>, description?: string, nullable?: boolean } {
  const resolved: { type: 'ARRAY', items: Record<string, unknown>, description?: string, nullable?: boolean } = {
    type: 'ARRAY',
    items: {},
    nullable: isNullable(schema) ? true : undefined
  };


  if (schema.items && typeof schema.items === 'object' && schema.items !== null && schema.items !== undefined) {
    const result = visit(schema.items as Record<string, unknown>);
    resolved.items = result || {};
  }

  return { ...resolved, ...getDocumentation(schema) };

}

function visitEnum(schema: Record<string, unknown>): { type: 'STRING', enum: string[], description?: string, nullable?: boolean } {
  const resolved: { type: 'STRING', enum: string[], description?: string, nullable?: boolean } = {
    type: 'STRING',
    enum: [],
    nullable: isNullable(schema) ? true : undefined
  };

  if (schema.enum && Array.isArray(schema.enum)) {
    resolved.enum = schema.enum;
  }

  return { ...resolved, ...getDocumentation(schema) };
}

function visitOneOf(schema: Record<string, unknown>): { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } {
  const resolved: { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } = {
    anyOf: [],
    nullable: isNullable(schema) ? true : undefined
  };

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    resolved.anyOf = schema.oneOf.map(visit);
  }

  return { ...resolved, ...getDocumentation(schema) };
}

function visitAllOf(schema: Record<string, unknown>): { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } {
  const resolved: { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } = {
    anyOf: [],
    nullable: isNullable(schema) ? true : undefined
  };

  if (schema.allOf && Array.isArray(schema.allOf)) {
    resolved.anyOf = schema.allOf.map(visit);
  }

  return { ...resolved, ...getDocumentation(schema) };
}

function visitAnyOf(schema: Record<string, unknown>): { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } {
  const resolved: { anyOf: Record<string, unknown>[], description?: string, nullable?: boolean } = {
    anyOf: [],
    nullable: isNullable(schema) ? true : undefined
  };

  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    resolved.anyOf = schema.anyOf.map(visit);
  }

  return { ...resolved, ...getDocumentation(schema) };
}

function getDocumentation(schema: Record<string, unknown>): { description?: string } {

  if (schema.description && typeof schema.description === 'string') {
    return { description: schema.description };
  }

  //Google GenAI does not support title
  if (schema.title && typeof schema.title === 'string') {
    return { description: schema.title };
  }

  return {};
}
