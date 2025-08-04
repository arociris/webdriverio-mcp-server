import { jest } from '@jest/globals';
import { sessionManager } from '../../src/services/sessionManager.js';
import { contextExtractor } from '../../src/services/contextExtractor.js';
import { actionExecutor } from '../../src/services/actionExecutor.js';

describe('SessionManager', () => {
  beforeEach(() => {
    // Clear all sessions before each test
    const activeSessions = sessionManager.getActiveSessionIds();
    for (const sessionId of activeSessions) {
      sessionManager.terminateSession(sessionId);
    }
  });

  describe('getSession', () => {
    it('should return null for non-existent session', () => {
      const session = sessionManager.getSession('non-existent');
      expect(session).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = sessionManager.getStats();
      
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('activeSessions');
      expect(stats).toHaveProperty('oldestSession');
      expect(typeof stats.totalSessions).toBe('number');
      expect(typeof stats.activeSessions).toBe('number');
      expect(typeof stats.oldestSession).toBe('number');
    });
  });

  describe('terminateSession', () => {
    it('should return false for non-existent session', async () => {
      const result = await sessionManager.terminateSession('non-existent');
      expect(result).toBe(false);
    });
  });
});

describe('ContextExtractor', () => {
  beforeEach(() => {
    // Reset element counters
    contextExtractor.resetCounters();
  });

  describe('getTypePrefix', () => {
    it('should return correct prefixes', () => {
      expect(contextExtractor.getTypePrefix('button')).toBe('b');
      expect(contextExtractor.getTypePrefix('input')).toBe('i');
      expect(contextExtractor.getTypePrefix('textarea')).toBe('t');
      expect(contextExtractor.getTypePrefix('a')).toBe('l');
      expect(contextExtractor.getTypePrefix('select')).toBe('s');
      expect(contextExtractor.getTypePrefix('unknown')).toBe('e');
    });
  });

  describe('getTypePrefix', () => {
    it('should return correct prefixes', () => {
      expect(contextExtractor.getTypePrefix('button')).toBe('b');
      expect(contextExtractor.getTypePrefix('input')).toBe('i');
      expect(contextExtractor.getTypePrefix('textarea')).toBe('t');
      expect(contextExtractor.getTypePrefix('a')).toBe('l');
      expect(contextExtractor.getTypePrefix('select')).toBe('s');
      expect(contextExtractor.getTypePrefix('unknown')).toBe('e');
    });
  });
});

describe('ActionExecutor', () => {
  describe('validateAction', () => {
    it('should validate click action correctly', () => {
      const validClick = { action: 'click', elementId: 'b_1' };
      const invalidClick = { action: 'click' };

      expect(actionExecutor.validateAction(validClick)).toBe(true);
      expect(actionExecutor.validateAction(invalidClick)).toBe(false);
    });

    it('should validate setValue action correctly', () => {
      const validSetValue = { action: 'setValue', elementId: 'i_1', value: 'test' };
      const invalidSetValue = { action: 'setValue', elementId: 'i_1' };

      expect(actionExecutor.validateAction(validSetValue)).toBe(true);
      expect(actionExecutor.validateAction(invalidSetValue)).toBe(false);
    });

    it('should validate navigate action correctly', () => {
      const validNavigate = { action: 'navigate', url: 'https://example.com' };
      const invalidNavigate = { action: 'navigate' };

      expect(actionExecutor.validateAction(validNavigate)).toBe(true);
      expect(actionExecutor.validateAction(invalidNavigate)).toBe(false);
    });
  });
}); 