import request from 'supertest';
import app from '../../src/server.js';
import { sessionManager } from '../../src/services/sessionManager.js';

describe('Session API Integration Tests', () => {
  let testSessionId;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up any remaining sessions
    const activeSessions = sessionManager.getActiveSessionIds();
    for (const sessionId of activeSessions) {
      await sessionManager.terminateSession(sessionId);
    }
  });

  describe('POST /session/start', () => {
    it('should start a new session successfully', async () => {
      const response = await request(app)
        .post('/session/start')
        .send({
          url: 'https://example.com',
          browserOptions: {
            headless: true,
            timeout: 10000,
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('context');
      expect(response.body.context).toHaveProperty('url');
      expect(response.body.context).toHaveProperty('title');
      expect(response.body.context).toHaveProperty('interactiveElements');
      expect(Array.isArray(response.body.context.interactiveElements)).toBe(true);

      testSessionId = response.body.sessionId;
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/session/start')
        .send({
          url: 'invalid-url',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/session/start')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('POST /session/:sessionId/act', () => {
    it('should execute navigate action successfully', async () => {
      const response = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'navigate',
          url: 'https://httpbin.org/forms/post',
        })
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', testSessionId);
      expect(response.body).toHaveProperty('context');
      expect(response.body.context.url).toContain('httpbin.org');
    });

    it('should execute click action successfully', async () => {
      // First navigate to a page with interactive elements
      await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'navigate',
          url: 'https://httpbin.org/forms/post',
        });

      // Get the current context to find an element to click
      const contextResponse = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'navigate',
          url: 'https://httpbin.org/forms/post',
        });

      const elements = contextResponse.body.context.interactiveElements;
      if (elements.length > 0) {
        const firstElement = elements[0];
        
        const response = await request(app)
          .post(`/session/${testSessionId}/act`)
          .send({
            action: 'click',
            elementId: firstElement.id,
          })
          .expect(200);

        expect(response.body).toHaveProperty('sessionId', testSessionId);
        expect(response.body).toHaveProperty('context');
      }
    });

    it('should execute setValue action successfully', async () => {
      // Navigate to a page with form inputs
      await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'navigate',
          url: 'https://httpbin.org/forms/post',
        });

      // Get the current context to find an input element
      const contextResponse = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'navigate',
          url: 'https://httpbin.org/forms/post',
        });

      const inputElements = contextResponse.body.context.interactiveElements.filter(
        el => el.type === 'input' || el.type === 'textarea'
      );

      if (inputElements.length > 0) {
        const firstInput = inputElements[0];
        
        const response = await request(app)
          .post(`/session/${testSessionId}/act`)
          .send({
            action: 'setValue',
            elementId: firstInput.id,
            value: 'test value',
          })
          .expect(200);

        expect(response.body).toHaveProperty('sessionId', testSessionId);
        expect(response.body).toHaveProperty('context');
      }
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .post('/session/non-existent-session/act')
        .send({
          action: 'navigate',
          url: 'https://example.com',
        })
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Session not found');
    });

    it('should return 400 for invalid action', async () => {
      const response = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'invalid-action',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 for missing elementId in click action', async () => {
      const response = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'click',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 for missing value in setValue action', async () => {
      const response = await request(app)
        .post(`/session/${testSessionId}/act`)
        .send({
          action: 'setValue',
          elementId: 'i_1',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('DELETE /session/:sessionId', () => {
    it('should terminate session successfully', async () => {
      const response = await request(app)
        .delete(`/session/${testSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'terminated');
      expect(response.body).toHaveProperty('sessionId', testSessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .delete('/session/non-existent-session')
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Session not found');
    });
  });

  describe('GET /session/stats', () => {
    it('should return session statistics', async () => {
      const response = await request(app)
        .get('/session/stats')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalSessions');
      expect(response.body.stats).toHaveProperty('activeSessions');
      expect(response.body.stats).toHaveProperty('oldestSession');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });
}); 