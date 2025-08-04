import { logger } from '../utils/logger.js';

class ContextExtractor {
  constructor() {
    this.contextLogger = logger.child({ context: 'ContextExtractor' });
    this.elementCounter = {};
  }

  async extractContext(browser) {
    try {
      this.elementCounter = {};
      const [url, title] = await Promise.all([
        browser.getUrl(),
        browser.getTitle(),
      ]);
      const interactiveElements = await this.extractInteractiveElements(browser);
      const context = {
        url,
        title,
        interactiveElements,
      };
      this.contextLogger.debug({ url, title, elementCount: interactiveElements.length }, 'Context extracted successfully');
      return {
        context,
        elementMap: this.buildElementMap(interactiveElements),
      };
    } catch (error) {
      this.contextLogger.error({ error: error.message }, 'Failed to extract context');
      throw error;
    }
  }

  async extractInteractiveElements(browser) {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'a[href]:not([disabled])',
      'select:not([disabled])',
    ];
    const elements = [];
    for (const selector of selectors) {
      try {
        const foundElements = await browser.$$(selector);
        for (let idx = 0; idx < foundElements.length; idx++) {
          const element = foundElements[idx];
          const elementInfo = await this.extractElementInfo(element, selector, idx + 1);
          if (elementInfo) {
            elements.push(elementInfo);
          }
        }
      } catch (error) {
        this.contextLogger.warn({ selector, error: error.message }, 'Failed to extract elements for selector');
      }
    }
    return elements;
  }

  async extractElementInfo(element, selector, index) {
    try {
      const isDisplayed = await element.isDisplayed();
      if (!isDisplayed) return null;
      const tagName = await element.getTagName();
      const type = tagName;
      // Prefer id, name, data-* for selector
      let id = await element.getAttribute('id');
      let name = await element.getAttribute('name');
      let dataTest = await element.getAttribute('data-testid');
      let dataQa = await element.getAttribute('data-qa');
      let selectorString = '';
      let uniqueId = '';
      if (id) {
        selectorString = `#${id}`;
        uniqueId = `${type}_${id}`;
      } else if (dataTest) {
        selectorString = `[data-testid="${dataTest}"]`;
        uniqueId = `${type}_dt_${dataTest}`;
      } else if (dataQa) {
        selectorString = `[data-qa="${dataQa}"]`;
        uniqueId = `${type}_dq_${dataQa}`;
      } else if (name) {
        selectorString = `${tagName}[name="${name}"]`;
        uniqueId = `${type}_n_${name}`;
      } else {
        // fallback to nth-of-type
        selectorString = `${tagName}:nth-of-type(${index})`;
        uniqueId = `${type}_idx_${index}`;
      }
      // Ensure uniqueId is unique in this context
      if (!this.elementCounter[uniqueId]) {
        this.elementCounter[uniqueId] = 1;
      } else {
        this.elementCounter[uniqueId]++;
        uniqueId = `${uniqueId}_${this.elementCounter[uniqueId]}`;
      }
      const [text, value, label] = await Promise.all([
        this.getElementText(element, type),
        this.getElementValue(element, type),
        this.getElementLabel(element, type),
      ]);
      return {
        id: uniqueId,
        type,
        label,
        text,
        value,
        selector: selectorString,
      };
    } catch (error) {
      this.contextLogger.debug({ error: error.message }, 'Failed to extract element info');
      return null;
    }
  }

  async getElementText(element, type) {
    try {
      if (type === 'button' || type === 'a') {
        return await element.getText();
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  async getElementValue(element, type) {
    try {
      if (type === 'input' || type === 'textarea' || type === 'select') {
        return await element.getValue();
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  async getElementLabel(element, type) {
    try {
      let label = await element.getAttribute('aria-label');
      if (label) return label;
      if (type === 'input' || type === 'textarea') {
        label = await element.getAttribute('placeholder');
        if (label) return label;
      }
      const id = await element.getAttribute('id');
      if (id) {
        try {
          const labelElement = await element.$(`label[for="${id}"]`);
          if (labelElement) {
            const labelText = await labelElement.getText();
            if (labelText) return labelText;
          }
        } catch {}
      }
      if (type === 'button' || type === 'a') {
        const text = await element.getText();
        if (text) return text;
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  buildElementMap(elements) {
    const elementMap = {};
    for (const element of elements) {
      elementMap[element.id] = {
        type: element.type,
        selector: element.selector,
      };
    }
    return elementMap;
  }
}

export const contextExtractor = new ContextExtractor(); 