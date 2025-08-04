import { remote } from 'webdriverio';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionLogger = logger.child({ context: 'SessionManager' });
    this.startCleanupInterval();
  }

  /**
   * Create a new browser session
   * @param {string} sessionId - Unique session identifier
   * @param {string} url - Initial URL to navigate to
   * @param {Object} browserOptions - Browser configuration options
   * @returns {Promise<Object>} Browser instance
   */
  async createSession(sessionId, url, browserOptions = {}) {
    try {
      const options = {
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--no-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              browserOptions.headless !== false ? '--headless' : '',
            ].filter(Boolean),
          },
        },
        logLevel: 'error',
        timeout: browserOptions.timeout || config.browser.timeout,
      };

      const browser = await remote(options);
      
      // Navigate to the initial URL
      await browser.url(url);
      
      // Store the session
      this.sessions.set(sessionId, {
        browser,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        url,
      });

      this.sessionLogger.info({ sessionId, url }, 'Session created successfully');
      return browser;
    } catch (error) {
      this.sessionLogger.error({ sessionId, error: error.message }, 'Failed to create session');
      throw error;
    }
  }

  /**
   * Get an existing browser session
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session object or null if not found
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.sessionLogger.debug({ sessionId }, 'Session retrieved');
    } else {
      this.sessionLogger.warn({ sessionId }, 'Session not found');
    }
    return session;
  }

  /**
   * Terminate a browser session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<boolean>} True if session was terminated, false if not found
   */
  async terminateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.sessionLogger.warn({ sessionId }, 'Session not found for termination');
      return false;
    }

    try {
      await session.browser.deleteSession();
      this.sessions.delete(sessionId);
      this.sessionLogger.info({ sessionId }, 'Session terminated successfully');
      return true;
    } catch (error) {
      this.sessionLogger.error({ sessionId, error: error.message }, 'Failed to terminate session');
      // Remove from map even if browser cleanup failed
      this.sessions.delete(sessionId);
      return true;
    }
  }

  /**
   * Get all active session IDs
   * @returns {Array<string>} Array of session IDs
   */
  getActiveSessionIds() {
    return Array.from(this.sessions.keys());
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > config.session.timeoutMs) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessionLogger.info({ sessionId }, 'Cleaning up expired session');
      await this.terminateSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      this.sessionLogger.info({ count: expiredSessions.length }, 'Cleaned up expired sessions');
    }
  }

  /**
   * Start the cleanup interval
   */
  startCleanupInterval() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions().catch(error => {
        this.sessionLogger.error({ error: error.message }, 'Error during cleanup');
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Get session statistics
   * @returns {Object} Session statistics
   */
  getStats() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values());
    
    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      oldestSession: activeSessions.length > 0 
        ? Math.floor((now - Math.min(...activeSessions.map(s => s.createdAt))) / 1000)
        : 0,
    };
  }
}

export const sessionManager = new SessionManager(); 