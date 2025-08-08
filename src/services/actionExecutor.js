import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import { AppError, Errors } from '../utils/errors.js';

class ActionExecutor {
  constructor() {
    this.actionLogger = logger.child({ context: 'ActionExecutor' });
  }

  async withRetries(fn, { retries = 2, delayMs = 200, onRetry } = {}) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const msg = (error && error.message) || '';
        const isStale = /stale( element)? reference/i.test(msg);
        const isDetached = /detached/i.test(msg);
        const isNotFound = /element.*not.*found/i.test(msg);
        if (attempt < retries && (isStale || isDetached || isNotFound)) {
          if (onRetry) onRetry({ attempt, error });
          await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async executeAction(browser, action, elementMap) {
    try {
      this.actionLogger.info({ action }, 'Executing action');
      let result = null;
      switch (action.action) {
        case 'click':
          result = await this.executeClick(browser, action.elementId, elementMap);
          break;
        case 'setValue':
          result = await this.executeSetValue(browser, action.elementId, action.value, elementMap);
          break;
        case 'getText':
          result = await this.executeGetText(browser, action.elementId, elementMap);
          break;
        case 'clearValue':
          result = await this.executeClearValue(browser, action.elementId, elementMap);
          break;
        case 'selectByVisibleText':
          result = await this.executeSelectByVisibleText(browser, action.elementId, action.text, elementMap);
          break;
        case 'selectByIndex':
          result = await this.executeSelectByIndex(browser, action.elementId, action.index, elementMap);
          break;
        case 'selectByAttribute':
          result = await this.executeSelectByAttribute(browser, action.elementId, action.attribute, action.value, elementMap);
          break;
        case 'keys':
          result = await this.executeKeys(browser, action.value);
          break;
        case 'scrollIntoView':
          result = await this.executeScrollIntoView(browser, action.elementId, elementMap);
          break;
        case 'screenshot':
          result = await this.executeScreenshot(browser, action.elementId, elementMap);
          break;
        case 'navigate':
          result = await this.executeNavigate(browser, action.url);
          break;
        case 'getAttribute':
          result = await this.executeGetAttribute(browser, action.elementId, action.attribute, elementMap);
          break;
        case 'isDisplayed':
          result = await this.executeIsDisplayed(browser, action.elementId, elementMap);
          break;
        case 'isEnabled':
          result = await this.executeIsEnabled(browser, action.elementId, elementMap);
          break;
        case 'isSelected':
          result = await this.executeIsSelected(browser, action.elementId, elementMap);
          break;
        case 'waitForDisplayed':
          result = await this.executeWaitFor(browser, action.elementId, elementMap, 'waitForDisplayed', action.timeout);
          break;
        case 'waitForEnabled':
          result = await this.executeWaitFor(browser, action.elementId, elementMap, 'waitForEnabled', action.timeout);
          break;
        case 'waitForExist':
          result = await this.executeWaitFor(browser, action.elementId, elementMap, 'waitForExist', action.timeout);
          break;
        case 'customScript':
          result = await this.executeCustomScript(browser, action.script, action.args);
          break;
        // Mobile specific actions
        case 'mobile:tap':
          result = await this.executeMobileTap(browser, action, elementMap);
          break;
        case 'mobile:swipe':
          result = await this.executeMobileSwipe(browser, action);
          break;
        case 'mobile:scroll':
          result = await this.executeMobileScroll(browser, action);
          break;
        case 'mobile:back':
          result = await this.executeMobileBack(browser);
          break;
        case 'mobile:pressKey':
          result = await this.executeMobilePressKey(browser, action.key);
          break;
        case 'mobile:hideKeyboard':
          result = await this.executeMobileHideKeyboard(browser);
          break;
        default:
          throw Errors.invalidAction(action.action);
      }
      this.actionLogger.info({ action }, 'Action executed successfully');
      return { message: `Action '${action.action}' executed successfully.`, result };
    } catch (error) {
      const appErr = error instanceof AppError ? error : new AppError(error.message);
      this.actionLogger.error({ action, error: appErr.message, code: appErr.code }, 'Failed to execute action');
      throw appErr;
    }
  }

  async getElement(browser, elementId, elementMap) {
    const elementInfo = elementMap[elementId];
    if (!elementInfo) {
      throw Errors.elementNotFound(elementId);
    }
    const locate = async () => await browser.$(elementInfo.selector);
    return this.withRetries(async () => {
      const el = await locate();
      // access a property to ensure it is attached
      await el.isExisting();
      return el;
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying getElement due to stale/detached/not found') });
  }

  async executeClick(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.scrollIntoView();
      await element.waitForClickable({ timeout: 5000 });
      await element.click();
      return { message: `Clicked element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying click') });
  }

  async executeSetValue(browser, elementId, value, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.scrollIntoView();
      await element.clearValue();
      await element.setValue(value);
      return { message: `Set value for element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying setValue') });
  }

  async executeGetText(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      const text = await element.getText();
      return { message: `Got text for element '${elementId}'.`, text };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying getText') });
  }

  async executeClearValue(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.clearValue();
      return { message: `Cleared value for element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying clearValue') });
  }

  async executeSelectByVisibleText(browser, elementId, text, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.selectByVisibleText(text);
      return { message: `Selected by visible text '${text}' for element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying selectByVisibleText') });
  }

  async executeSelectByIndex(browser, elementId, index, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.selectByIndex(index);
      return { message: `Selected by index '${index}' for element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying selectByIndex') });
  }

  async executeSelectByAttribute(browser, elementId, attribute, value, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    return this.withRetries(async () => {
      await element.selectByAttribute(attribute, value);
      return { message: `Selected by attribute '${attribute}'='${value}' for element '${elementId}'.` };
    }, { onRetry: ({ attempt, error }) => this.actionLogger.warn({ elementId, attempt, error: error.message }, 'Retrying selectByAttribute') });
  }

  async executeKeys(browser, value) {
    await browser.keys(value);
    return { message: `Sent keys '${value}'.` };
  }

  async executeScrollIntoView(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.scrollIntoView();
    return { message: `Scrolled element '${elementId}' into view.` };
  }

  async executeScreenshot(browser, elementId, elementMap) {
    let screenshot;
    if (elementId) {
      const element = await this.getElement(browser, elementId, elementMap);
      screenshot = await element.saveScreenshot();
    } else {
      screenshot = await browser.takeScreenshot();
    }
    return { message: 'Screenshot taken.', screenshot: screenshot.toString('base64') };
  }

  async executeNavigate(browser, url) {
    await browser.url(url);
    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        return readyState === 'complete';
      },
      { timeout: 15000, timeoutMsg: 'Page did not load completely' }
    );
    return { message: `Navigated to '${url}'.` };
  }

  async executeGetAttribute(browser, elementId, attribute, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    const attr = await element.getAttribute(attribute);
    return { message: `Got attribute '${attribute}' for element '${elementId}'.`, attribute: attr };
  }

  async executeIsDisplayed(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    const displayed = await element.isDisplayed();
    return { message: `Checked isDisplayed for element '${elementId}'.`, isDisplayed: displayed };
  }

  async executeIsEnabled(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    const enabled = await element.isEnabled();
    return { message: `Checked isEnabled for element '${elementId}'.`, isEnabled: enabled };
  }

  async executeIsSelected(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    const selected = await element.isSelected();
    return { message: `Checked isSelected for element '${elementId}'.`, isSelected: selected };
  }

  async executeWaitFor(browser, elementId, elementMap, waitType, timeout) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element[waitType]({ timeout: timeout || 5000 });
    return { message: `Waited for '${waitType}' on element '${elementId}'.` };
  }

  async executeCustomScript(browser, script, args) {
    const result = await browser.execute(new Function(...(args || []), script));
    return { message: 'Custom script executed.', result };
  }

  async executeMobileTap(browser, action, elementMap) {
    if (action.elementId) {
      const el = await this.getElement(browser, action.elementId, elementMap);
      await el.touchAction('tap');
    } else if (typeof action.x === 'number' && typeof action.y === 'number') {
      await browser.touchAction({ action: 'tap', x: action.x, y: action.y });
    } else {
      throw new AppError('mobile:tap requires either elementId or x/y coordinates', { code: 'INVALID_PARAMS', status: 400 });
    }
    return { message: 'Tap performed.' };
  }

  async executeMobileSwipe(browser, action) {
    const { direction, duration = 300, x, y } = action;
    if (!direction) {
      throw new AppError('mobile:swipe requires direction (up/down/left/right)', { code: 'INVALID_PARAMS', status: 400 });
    }
    const size = await browser.getWindowSize();
    const startX = x ?? Math.floor(size.width / 2);
    const startY = y ?? Math.floor(size.height / 2);
    const distance = Math.floor(Math.min(size.width, size.height) * 0.35);

    let endX = startX, endY = startY;
    if (direction === 'up') endY = startY - distance;
    if (direction === 'down') endY = startY + distance;
    if (direction === 'left') endX = startX - distance;
    if (direction === 'right') endX = startX + distance;

    await browser.touchPerform([
      { action: 'press', options: { x: startX, y: startY } },
      { action: 'wait', options: { ms: duration } },
      { action: 'moveTo', options: { x: endX, y: endY } },
      { action: 'release' },
    ]);

    return { message: `Swipe ${direction} performed.` };
  }

  async executeMobileScroll(browser, action) {
    // For native apps, better to use driver specific scrolls; here we emulate by swipe
    return this.executeMobileSwipe(browser, { direction: action.direction || 'down', duration: action.duration || 300 });
  }

  async executeMobileBack(browser) {
    await browser.back();
    return { message: 'Back navigation performed.' };
  }

  async executeMobilePressKey(browser, key) {
    if (!key) throw new AppError('mobile:pressKey requires key', { code: 'INVALID_PARAMS', status: 400 });
    if (typeof browser.pressKeyCode === 'function') {
      // Android specific keycode method (UiAutomator2)
      // Map common keys if needed; here assume numeric or string mapping done by client
      await browser.pressKeyCode(key);
    } else {
      // Fallback to keys
      await browser.keys(key);
    }
    return { message: `Key '${key}' sent.` };
  }

  async executeMobileHideKeyboard(browser) {
    if (typeof browser.hideKeyboard === 'function') {
      await browser.hideKeyboard();
    } else {
      // Try common fallbacks
      await browser.keys('Escape');
    }
    return { message: 'Keyboard hidden.' };
  }

  validateAction(action) {
    return !!action.action;
  }
}

export const actionExecutor = new ActionExecutor(); 