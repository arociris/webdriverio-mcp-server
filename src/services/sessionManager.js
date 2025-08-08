import { remote } from 'webdriverio';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionLogger = logger.child({ context: 'SessionManager' });
    this.startCleanupInterval();
  }

  async createSession(sessionId, url, browserOptions = {}, mobile) {
    try {
      let options;
      if (mobile && mobile.enabled) {
        // Appium mobile session
        const caps = {
          platformName: mobile.platformName,
          deviceName: mobile.deviceName,
          automationName: mobile.automationName || (mobile.platformName === 'iOS' ? 'XCUITest' : 'UiAutomator2'),
          app: mobile.app,
          browserName: mobile.browserName,
          platformVersion: mobile.platformVersion,
          appPackage: mobile.appPackage,
          appActivity: mobile.appActivity,
          udid: mobile.udid,
          noReset: mobile.noReset,
          fullReset: mobile.fullReset,
          language: mobile.language,
          locale: mobile.locale,
          newCommandTimeout: mobile.newCommandTimeout || 120,
          ...(mobile.otherCaps || {}),
        };
        options = {
          protocol: config.appium.protocol,
          hostname: config.appium.host,
          port: config.appium.port,
          path: config.appium.path,
          logLevel: 'error',
          capabilities: caps,
          connectionRetryCount: 1,
        };
      } else {
        // Desktop browser session
        options = {
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
      }

      const browser = await remote(options);

      // Navigate if URL provided or if this is a mobile browser session
      if (url) {
        await browser.url(url);
      }

      this.sessions.set(sessionId, {
        browser,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        url,
        isMobile: !!(mobile && mobile.enabled),
      });

      this.sessionLogger.info({ sessionId, url, isMobile: !!(mobile && mobile.enabled) }, 'Session created successfully');
      return browser;
    } catch (error) {
      this.sessionLogger.error({ sessionId, error: error.message }, 'Failed to create session');
      throw error;
    }
  }

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
      this.sessions.delete(sessionId);
      return true;
    }
  }

  getActiveSessionIds() {
    return Array.from(this.sessions.keys());
  }

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

  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredSessions().catch(error => {
        this.sessionLogger.error({ error: error.message }, 'Error during cleanup');
      });
    }, 5 * 60 * 1000);
  }

  getStats() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values());

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      oldestSession: activeSessions.length > 0
        ? Math.floor((now - Math.min(...activeSessions.map(s => s.createdAt))) / 1000)
        : 0,
      mobileSessions: activeSessions.filter(s => s.isMobile).length,
      desktopSessions: activeSessions.filter(s => !s.isMobile).length,
    };
  }
}

export const sessionManager = new SessionManager(); 