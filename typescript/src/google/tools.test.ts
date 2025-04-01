import { ToolDefinition } from '../client';
import { convertToGenaiTools } from './tools';
import * as utils from './utils';

describe('convertToGenaiTools', () => {

  it('converts a simple tool with primitive parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'testTool',
          description: 'A test tool',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'User name'
              }
            },
            required: ['name']
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'testTool',
            description: 'A test tool',
            parameters: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING', description: 'User name' }
              },
              required: ['name']
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with object parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'userDetails',
          description: 'User details tool',
          parameters: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'User name'
                  }
                },
                required: ['name']
              }
            },
            required: ['user']
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'userDetails',
            description: 'User details tool',
            parameters: {
              type: 'OBJECT',
              properties: {
                user: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING', description: 'User name' }
                  },
                  required: ['name']
                }
              },
              required: ['user']
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with array parameters', () => {

    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'listItems',
          description: 'List items tool',
          parameters: {
            type: 'array',
            items: {
              type: 'string',
              description: 'Item name'
            }
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'listItems',
            description: 'List items tool',
            parameters: {
              type: 'ARRAY',
              items: { type: 'STRING', description: 'Item name' }
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with enum parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'selectColor',
          description: 'Color selection tool',
          parameters: {
            type: 'string',
            enum: ['red', 'green', 'blue'],
            description: 'Color options'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'selectColor',
            description: 'Color selection tool',
            parameters: {
              type: 'STRING',
              enum: ['red', 'green', 'blue'],
              description: 'Color options'
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with nullable parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'optionalInput',
          description: 'Optional input tool',
          parameters: {
            type: ['string', 'null'],
            description: 'Optional text input'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'optionalInput',
            description: 'Optional input tool',
            parameters: {
              type: 'STRING',
              nullable: true,
              description: 'Optional text input'
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with number parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'calculateAmount',
          description: 'Calculate amount tool',
          parameters: {
            type: 'number',
            description: 'Amount to calculate'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'calculateAmount',
            description: 'Calculate amount tool',
            parameters: {
              type: 'NUMBER',
              description: 'Amount to calculate'
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with integer parameters', () => {

    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'setCount',
          description: 'Set count tool',
          parameters: {
            type: 'integer',
            description: 'Count value'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'setCount',
            description: 'Set count tool',
            parameters: {
              type: 'INTEGER',
              description: 'Count value'
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with boolean parameters', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'toggleFeature',
          description: 'Toggle feature tool',
          parameters: {
            type: 'boolean',
            description: 'Feature enabled status'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'toggleFeature',
            description: 'Toggle feature tool',
            parameters: {
              type: 'BOOLEAN',
              description: 'Feature enabled status'
            }
          }
        ]
      }
    ]);
  });

  it('converts a tool with oneOf parameters', () => {

    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'processData',
          description: 'Process data tool',
          parameters: {
            oneOf: [
              {
                type: 'string',
                description: 'Text data'
              },
              {
                type: 'number',
                description: 'Numeric data'
              }
            ]
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'processData',
            description: 'Process data tool',
            parameters: {
              anyOf: [
                { type: 'STRING', description: 'Text data' },
                { type: 'NUMBER', description: 'Numeric data' }
              ]
            }
          }
        ]
      }
    ]);
  });


  it('properly handles oneOf with multiple schema types', () => {

    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'oneOfTest',
          description: 'Test oneOf union',
          parameters: {
            oneOf: [
              { type: 'string', description: 'Text data' },
              { type: 'number', description: 'Numeric data' }
            ],
            description: 'Either string or number'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'oneOfTest',
            description: 'Test oneOf union',
            parameters: {
              anyOf: [
                { type: 'STRING', description: 'Text data' },
                { type: 'NUMBER', description: 'Numeric data' }
              ],
              description: 'Either string or number'
            }
          }
        ]
      }
    ]);
  });

  it('properly handles allOf schemas', () => {
    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'allOfTest',
          description: 'Test allOf union',
          parameters: {
            allOf: [
              { type: 'object', properties: { name: { type: 'string', description: 'User name' } }, required: ['name'] },
              { type: 'object', properties: { email: { type: 'string', description: 'User email' } }, required: ['email'] },
            ],
            description: 'Must include both name and email'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'allOfTest',
            description: 'Test allOf union',
            parameters: {
              description: 'Must include both name and email',
              anyOf: [{
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING', description: 'User name' },
                },
                required: ['name'],
              },
              {
                type: 'OBJECT',
                properties: {
                  email: { type: 'STRING', description: 'User email' }
                },
                required: ['email'],
              }
              ]
            }
          }
        ]
      }
    ]);
  });

  it('properly handles anyOf schemas', () => {

    const tools: ToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'anyOfTest',
          description: 'Test anyOf union',
          parameters: {
            anyOf: [
              { type: 'string', description: 'Text data' },
              { type: 'number', description: 'Numeric data' }
            ],
            description: 'Can be string or number'
          }
        }
      }
    ];

    const result = convertToGenaiTools(tools);

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'anyOfTest',
            description: 'Test anyOf union',
            parameters: {
              anyOf: [
                { type: 'STRING', description: 'Text data' },
                { type: 'NUMBER', description: 'Numeric data' }
              ],
              description: 'Can be string or number'
            }
          }
        ]
      }
    ]);
  });

it('handles null type parameters', () => {
  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'nullParam',
        description: 'Null param tool',
        parameters: {
          type: 'null'
        }
      }
    }
  ];

  const result = convertToGenaiTools(tools);

  expect(result).toEqual([
    {
      functionDeclarations: [
        {
          name: 'nullParam',
          description: 'Null param tool',
          parameters: {
            nullable: true
          }
        }
      ]
    }
  ]);
});

it('throws error for unsupported parameter type', () => {
  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'unsupportedParam',
        description: 'Unsupported param tool',
        parameters: {
          type: 'unsupported'
        }
      }
    }
  ];

  expect(() => convertToGenaiTools(tools)).toThrow(/Unsupported parameter type/);
});

it('handles documentation from description', () => {

  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'docTool',
        description: 'Documentation tool',
        parameters: {
          type: 'string',
          description: 'Parameter description'
        }
      }
    }
  ];

  const result = convertToGenaiTools(tools);

  expect(result).toEqual([
    {
      functionDeclarations: [
        {
          name: 'docTool',
          description: 'Documentation tool',
          parameters: {
            type: 'STRING',
            description: 'Parameter description'
          }
        }
      ]
    }
  ]);
});

it('handles documentation from title when description is not available', () => {

  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'titleTool',
        description: 'Title tool',
        parameters: {
          type: 'string',
          title: 'Parameter title'
        }
      }
    }
  ];

  const result = convertToGenaiTools(tools);

  expect(result).toEqual([
    {
      functionDeclarations: [
        {
          name: 'titleTool',
          description: 'Title tool',
          parameters: {
            type: 'STRING',
            description: 'Parameter title'
          }
        }
      ]
    }
  ]);
});

it('handles empty parameter object', () => {

  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'emptyParams',
        description: 'Empty params tool',
        parameters: { type: 'object', properties: {} }
      }
    }
  ];

  const result = convertToGenaiTools(tools);

  const functionDeclaration = result[0]?.functionDeclarations?.[0];
  expect(functionDeclaration?.name).toBe('emptyParams');
  expect(functionDeclaration?.description).toBe('Empty params tool');

  const parameters = functionDeclaration?.parameters as Record<string, any>;
  expect(parameters?.type).toBe('OBJECT');
});

it('handles parameters with default object structure', () => {
  const tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'noParams',
        description: 'No params tool',
        parameters: { type: 'object' }
      }
    }
  ];

  const result = convertToGenaiTools(tools);

  const functionDeclaration = result[0]?.functionDeclarations?.[0];
  expect(functionDeclaration?.name).toBe('noParams');
  expect(functionDeclaration?.description).toBe('No params tool');

  const parameters = functionDeclaration?.parameters as Record<string, any>;
  expect(parameters?.type).toBe('OBJECT');
});
});
