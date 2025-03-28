import { FunctionCall } from '@google/genai';
import { ToolRunResult } from './index';
import { ToolRun } from '../client';

describe('ToolRunResult', () => {
  let toolCall: FunctionCall;
  let toolRun: ToolRun;
  let toolRunResult: ToolRunResult;

  beforeEach(() => {
    toolCall = {
      id: 'function-call-id',
      name: 'test-function',
      args: { foo: 'bar' }
    };
  });

  describe('success result', () => {
    beforeEach(() => {
      toolRun = {
        status: 'success',
        result: { data: 'test-data' },
        assistant_hint: 'test hint'
      };
      toolRunResult = new ToolRunResult(toolCall, toolRun);
    });

    it('returns correct status', () => {
      expect(toolRunResult.status).toBe('success');
    });

    it('returns correct result', () => {
      expect(toolRunResult.result).toEqual({ data: 'test-data' });
    });

    it('returns undefined for error', () => {
      expect(toolRunResult.error).toBeUndefined();
    });

    it('returns undefined for actionType', () => {
      expect(toolRunResult.actionType).toBeUndefined();
    });

    it('returns undefined for actionUrl', () => {
      expect(toolRunResult.actionUrl).toBeUndefined();
    });

    it('returns correct assistantHint', () => {
      expect(toolRunResult.assistantHint).toBe('test hint');
    });

    it('converts to string correctly', () => {
      expect(toolRunResult.toString()).toBe(JSON.stringify(toolRun));
    });

    it('converts to message correctly', () => {
      const message = toolRunResult.toMessage();
      expect(message).toEqual({
        role: 'user',
        parts: [{
          functionResponse: {
            id: 'function-call-id',
            name: 'test-function',
            response: { output: { data: 'test-data' } }
          }
        }]
      });
    });
  });

  describe('error result', () => {
    beforeEach(() => {
      toolRun = {
        status: 'error',
        error: 'test-error',
        assistant_hint: 'error hint'
      };
      toolRunResult = new ToolRunResult(toolCall, toolRun);
    });

    it('returns correct status', () => {
      expect(toolRunResult.status).toBe('error');
    });

    it('returns undefined for result', () => {
      expect(toolRunResult.result).toBeUndefined();
    });

    it('returns correct error', () => {
      expect(toolRunResult.error).toBe('test-error');
    });

    it('returns undefined for actionType', () => {
      expect(toolRunResult.actionType).toBeUndefined();
    });

    it('returns undefined for actionUrl', () => {
      expect(toolRunResult.actionUrl).toBeUndefined();
    });

    it('converts to message correctly for error', () => {
      const message = toolRunResult.toMessage();
      expect(message).toEqual({
        role: 'user',
        parts: [{
          functionResponse: {
            id: 'function-call-id',
            name: 'test-function',
            response: { error: 'test-error' }
          }
        }]
      });
    });
  });

  describe('requires action result', () => {
    beforeEach(() => {
      toolRun = {
        status: 'requires_action',
        action_type: 'link',
        action_url: 'https://example.com',
        assistant_hint: 'action hint'
      };
      toolRunResult = new ToolRunResult(toolCall, toolRun);
    });

    it('returns correct status', () => {
      expect(toolRunResult.status).toBe('requires_action');
    });

    it('returns undefined for result', () => {
      expect(toolRunResult.result).toBeUndefined();
    });

    it('returns undefined for error', () => {
      expect(toolRunResult.error).toBeUndefined();
    });

    it('returns correct actionType', () => {
      expect(toolRunResult.actionType).toBe('link');
    });

    it('returns correct actionUrl', () => {
      expect(toolRunResult.actionUrl).toBe('https://example.com');
    });

    it('converts to message correctly for action required', () => {
      const message = toolRunResult.toMessage();
      expect(message).toEqual({
        role: 'user',
        parts: [{
          functionResponse: {
            id: 'function-call-id',
            name: 'test-function',
            response: toolRun
          }
        }]
      });
    });
  });
});