import * as utils from './utils';

describe('isObject', () => {
  it('returns true when type is object', () => {
    expect(utils.isObject({ type: 'object' })).toBe(true);
  });

  it('returns true when type is nullable object', () => {
    expect(utils.isObject({ type: ['object', 'null'] })).toBe(true);
    expect(utils.isObject({ type: ['null', 'object'] })).toBe(true);
  });

  it('returns true when properties is defined', () => {
    expect(utils.isObject({ type: 'string', properties: {} })).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(utils.isObject({ type: 'string' })).toBe(false);
    expect(utils.isObject({ type: 'array' })).toBe(false);
    expect(utils.isObject({ type: 'number' })).toBe(false);
    expect(utils.isObject({ type: 'boolean' })).toBe(false);
    expect(utils.isObject({ type: 'integer' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isObject(undefined)).toBe(false);
    expect(utils.isObject(null)).toBe(false);
    expect(utils.isObject({})).toBe(false);
    expect(utils.isObject('string')).toBe(false);
    expect(utils.isObject(123)).toBe(false);
    expect(utils.isObject(true)).toBe(false);
    expect(utils.isObject([])).toBe(false);
  });
});

describe('isArray', () => {
  it('returns true when type is array', () => {
    expect(utils.isArray({ type: 'array' })).toBe(true);
  });

  it('returns true when type is nullable array', () => {
    expect(utils.isArray({ type: ['array', 'null'] })).toBe(true);
    expect(utils.isArray({ type: ['null', 'array'] })).toBe(true);
  });

  it('returns true when items is defined', () => {
    expect(utils.isArray({ type: 'string', items: {} })).toBe(true);
  });

  it('returns false for non-arrays', () => {
    expect(utils.isArray({ type: 'string' })).toBe(false);
    expect(utils.isArray({ type: 'object' })).toBe(false);
    expect(utils.isArray({ type: 'number' })).toBe(false);
    expect(utils.isArray({ type: 'boolean' })).toBe(false);
    expect(utils.isArray({ type: 'integer' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isArray(undefined)).toBe(false);
    expect(utils.isArray(null)).toBe(false);
    expect(utils.isArray({})).toBe(false);
    expect(utils.isArray('string')).toBe(false);
    expect(utils.isArray(123)).toBe(false);
    expect(utils.isArray(true)).toBe(false);
    expect(utils.isArray([])).toBe(false);
  });
});

describe('isInteger', () => {
  it('returns true when type is integer', () => {
    expect(utils.isInteger({ type: 'integer' })).toBe(true);
  });

  it('returns true when type is nullable integer', () => {
    expect(utils.isInteger({ type: ['integer', 'null'] })).toBe(true);
    expect(utils.isInteger({ type: ['null', 'integer'] })).toBe(true);
  });

  it('returns false for non-integers', () => {
    expect(utils.isInteger({ type: 'string' })).toBe(false);
    expect(utils.isInteger({ type: 'object' })).toBe(false);
    expect(utils.isInteger({ type: 'array' })).toBe(false);
    expect(utils.isInteger({ type: 'number' })).toBe(false);
    expect(utils.isInteger({ type: 'boolean' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isInteger(undefined)).toBe(false);
    expect(utils.isInteger(null)).toBe(false);
    expect(utils.isInteger({})).toBe(false);
    expect(utils.isInteger('string')).toBe(false);
    expect(utils.isInteger(123)).toBe(false);
    expect(utils.isInteger(true)).toBe(false);
    expect(utils.isInteger([])).toBe(false);
  });
});

describe('isBoolean', () => {
  it('returns true when type is boolean', () => {
    expect(utils.isBoolean({ type: 'boolean' })).toBe(true);
  });

  it('returns true when type is nullable boolean', () => {
    expect(utils.isBoolean({ type: ['boolean', 'null'] })).toBe(true);
    expect(utils.isBoolean({ type: ['null', 'boolean'] })).toBe(true);
  });

  it('returns false for non-booleans', () => {
    expect(utils.isBoolean({ type: 'string' })).toBe(false);
    expect(utils.isBoolean({ type: 'object' })).toBe(false);
    expect(utils.isBoolean({ type: 'array' })).toBe(false);
    expect(utils.isBoolean({ type: 'number' })).toBe(false);
    expect(utils.isBoolean({ type: 'integer' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isBoolean(undefined)).toBe(false);
    expect(utils.isBoolean(null)).toBe(false);
    expect(utils.isBoolean({})).toBe(false);
    expect(utils.isBoolean('string')).toBe(false);
    expect(utils.isBoolean(123)).toBe(false);
    expect(utils.isBoolean(true)).toBe(false);
    expect(utils.isBoolean([])).toBe(false);
  });
});

describe('isNumber', () => {
  it('returns true when type is number', () => {
    expect(utils.isNumber({ type: 'number' })).toBe(true);
  });

  it('returns true when type is nullable number', () => {
    expect(utils.isNumber({ type: ['number', 'null'] })).toBe(true);
    expect(utils.isNumber({ type: ['null', 'number'] })).toBe(true);
  });

  it('returns false for non-numbers', () => {
    expect(utils.isNumber({ type: 'string' })).toBe(false);
    expect(utils.isNumber({ type: 'object' })).toBe(false);
    expect(utils.isNumber({ type: 'array' })).toBe(false);
    expect(utils.isNumber({ type: 'boolean' })).toBe(false);
    expect(utils.isNumber({ type: 'integer' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isNumber(undefined)).toBe(false);
    expect(utils.isNumber(null)).toBe(false);
    expect(utils.isNumber({})).toBe(false);
    expect(utils.isNumber('string')).toBe(false);
    expect(utils.isNumber(123)).toBe(false);
    expect(utils.isNumber(true)).toBe(false);
    expect(utils.isNumber([])).toBe(false);
  });
});

describe('isString', () => {
  it('returns true when type is string', () => {
    expect(utils.isString({ type: 'string' })).toBe(true);
  });

  it('returns true when type is nullable string', () => {
    expect(utils.isString({ type: ['string', 'null'] })).toBe(true);
    expect(utils.isString({ type: ['null', 'string'] })).toBe(true);
  });

  it('returns false for non-strings', () => {
    expect(utils.isString({ type: 'number' })).toBe(false);
    expect(utils.isString({ type: 'object' })).toBe(false);
    expect(utils.isString({ type: 'array' })).toBe(false);
    expect(utils.isString({ type: 'boolean' })).toBe(false);
    expect(utils.isString({ type: 'integer' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isString(undefined)).toBe(false);
    expect(utils.isString(null)).toBe(false);
    expect(utils.isString({})).toBe(false);
    expect(utils.isString('string')).toBe(false);
    expect(utils.isString(123)).toBe(false);
    expect(utils.isString(true)).toBe(false);
    expect(utils.isString([])).toBe(false);
  });
});

describe('isNullable', () => {
  it('returns true when type is null', () => {
    expect(utils.isNullable({ type: 'null' })).toBe(true);
  });

  it('returns true when type contains null', () => {
    expect(utils.isNullable({ type: ['string', 'null'] })).toBe(true);
    expect(utils.isNullable({ type: ['null', 'object'] })).toBe(true);
    expect(utils.isNullable({ type: ['number', 'null', 'string'] })).toBe(true);
  });

  it('returns false when type does not contain null', () => {
    expect(utils.isNullable({ type: 'string' })).toBe(false);
    expect(utils.isNullable({ type: ['string', 'number'] })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isNullable(undefined)).toBe(false);
    expect(utils.isNullable(null)).toBe(false);
    expect(utils.isNullable({})).toBe(false);
    expect(utils.isNullable('string')).toBe(false);
    expect(utils.isNullable(123)).toBe(false);
    expect(utils.isNullable(true)).toBe(false);
    expect(utils.isNullable([])).toBe(false);
  });
});

describe('isEnum', () => {
  it('returns true when enum is defined', () => {
    expect(utils.isEnum({ enum: ['a', 'b', 'c'] })).toBe(true);
    expect(utils.isEnum({ type: 'string', enum: ['a', 'b', 'c'] })).toBe(true);
  });

  it('returns false when enum is not defined or not an array', () => {
    expect(utils.isEnum({ type: 'string' })).toBe(false);
    expect(utils.isEnum({ enum: 'not an array' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isEnum(undefined)).toBe(false);
    expect(utils.isEnum(null)).toBe(false);
    expect(utils.isEnum({})).toBe(false);
    expect(utils.isEnum('string')).toBe(false);
    expect(utils.isEnum(123)).toBe(false);
    expect(utils.isEnum(true)).toBe(false);
    expect(utils.isEnum([])).toBe(false);
  });
});

describe('isOneOf', () => {
  it('returns true when oneOf is defined', () => {
    expect(utils.isOneOf({ oneOf: [{ type: 'string' }, { type: 'number' }] })).toBe(true);
  });

  it('returns false when oneOf is not defined or not an array', () => {
    expect(utils.isOneOf({ type: 'string' })).toBe(false);
    expect(utils.isOneOf({ oneOf: 'not an array' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isOneOf(undefined)).toBe(false);
    expect(utils.isOneOf(null)).toBe(false);
    expect(utils.isOneOf({})).toBe(false);
    expect(utils.isOneOf('string')).toBe(false);
    expect(utils.isOneOf(123)).toBe(false);
    expect(utils.isOneOf(true)).toBe(false);
    expect(utils.isOneOf([])).toBe(false);
  });
});

describe('isAllOf', () => {
  it('returns true when allOf is defined', () => {
    expect(utils.isAllOf({ allOf: [{ type: 'string' }, { type: 'number' }] })).toBe(true);
  });

  it('returns false when allOf is not defined or not an array', () => {
    expect(utils.isAllOf({ type: 'string' })).toBe(false);
    expect(utils.isAllOf({ allOf: 'not an array' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isAllOf(undefined)).toBe(false);
    expect(utils.isAllOf(null)).toBe(false);
    expect(utils.isAllOf({})).toBe(false);
    expect(utils.isAllOf('string')).toBe(false);
    expect(utils.isAllOf(123)).toBe(false);
    expect(utils.isAllOf(true)).toBe(false);
    expect(utils.isAllOf([])).toBe(false);
  });
});

describe('isAnyOf', () => {
  it('returns true when anyOf is defined', () => {
    expect(utils.isAnyOf({ anyOf: [{ type: 'string' }, { type: 'number' }] })).toBe(true);
  });

  it('returns false when anyOf is not defined or not an array', () => {
    expect(utils.isAnyOf({ type: 'string' })).toBe(false);
    expect(utils.isAnyOf({ anyOf: 'not an array' })).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(utils.isAnyOf(undefined)).toBe(false);
    expect(utils.isAnyOf(null)).toBe(false);
    expect(utils.isAnyOf({})).toBe(false);
    expect(utils.isAnyOf('string')).toBe(false);
    expect(utils.isAnyOf(123)).toBe(false);
    expect(utils.isAnyOf(true)).toBe(false);
    expect(utils.isAnyOf([])).toBe(false);
  });
});

describe('nullableOr', () => {
  // Test the private nullableOr function indirectly through the public functions
  it('correctly identifies nullable types through isString', () => {
    expect(utils.isString({ type: ['string', 'null'] })).toBe(true);
    expect(utils.isString({ type: ['null', 'string'] })).toBe(true);
    expect(utils.isString({ type: ['string'] })).toBe(true);
  });

  it('correctly rejects non-matching types with null', () => {
    expect(utils.isString({ type: ['number', 'null'] })).toBe(false);
    expect(utils.isString({ type: ['null', 'number'] })).toBe(false);
  });

  it('correctly rejects arrays with more than two types', () => {
    expect(utils.isString({ type: ['string', 'number', 'null'] })).toBe(false);
  });
}); 