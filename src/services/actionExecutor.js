import { logger } from '../utils/logger.js';
import fs from 'fs/promises';

class ActionExecutor {
  constructor() {
    this.actionLogger = logger.child({ context: 'ActionExecutor' });
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
        default:
          throw new Error(`Unsupported action: ${action.action}`);
      }
      this.actionLogger.info({ action }, 'Action executed successfully');
      return { message: `Action '${action.action}' executed successfully.`, result };
    } catch (error) {
      this.actionLogger.error({ action, error: error.message }, 'Failed to execute action');
      throw error;
    }
  }

  async getElement(browser, elementId, elementMap) {
    const elementInfo = elementMap[elementId];
    if (!elementInfo) {
      throw new Error(`Element with id '${elementId}' was not found in the current page context.`);
    }
    const element = await browser.$(elementInfo.selector);
    return element;
  }

  async executeClick(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.scrollIntoView();
    await element.waitForClickable({ timeout: 5000 });
    await element.click();
    return { message: `Clicked element '${elementId}'.` };
  }

  async executeSetValue(browser, elementId, value, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.scrollIntoView();
    await element.clearValue();
    await element.setValue(value);
    return { message: `Set value for element '${elementId}'.` };
  }

  async executeGetText(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    const text = await element.getText();
    return { message: `Got text for element '${elementId}'.`, text };
  }

  async executeClearValue(browser, elementId, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.clearValue();
    return { message: `Cleared value for element '${elementId}'.` };
  }

  async executeSelectByVisibleText(browser, elementId, text, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.selectByVisibleText(text);
    return { message: `Selected by visible text '${text}' for element '${elementId}'.` };
  }

  async executeSelectByIndex(browser, elementId, index, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.selectByIndex(index);
    return { message: `Selected by index '${index}' for element '${elementId}'.` };
  }

  async executeSelectByAttribute(browser, elementId, attribute, value, elementMap) {
    const element = await this.getElement(browser, elementId, elementMap);
    await element.selectByAttribute(attribute, value);
    return { message: `Selected by attribute '${attribute}'='${value}' for element '${elementId}'.` };
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
    // Return base64 string
    return { message: 'Screenshot taken.', screenshot: screenshot.toString('base64') };
  }

  async executeNavigate(browser, url) {
    await browser.url(url);
    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        return readyState === 'complete';
      },
      {
        timeout: 10000,
        timeoutMsg: 'Page did not load completely',
      }
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

  validateAction(action) {
    // This can be expanded for stricter validation if needed
    return !!action.action;
  }
}

export const actionExecutor = new ActionExecutor(); 