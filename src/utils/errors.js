export class AppError extends Error {
  constructor(message, { code = 'INTERNAL_ERROR', status = 500, suggestion, details } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.suggestion = suggestion;
    this.details = details;
  }
}

export const Errors = {
  elementNotFound: (elementId, selector) =>
    new AppError(`Element with id '${elementId}' was not found in the current page context.`, {
      code: 'ELEMENT_NOT_FOUND',
      status: 404,
      suggestion: 'Re-extract context, verify selector stability, or wait for the element to exist.',
      details: { elementId, selector },
    }),

  elementNotInteractable: (elementId) =>
    new AppError(`Element '${elementId}' is not interactable.`, {
      code: 'ELEMENT_NOT_INTERACTABLE',
      status: 409,
      suggestion: 'Ensure element is visible, enabled, and not covered; consider scrollIntoView or waitForDisplayed.',
      details: { elementId },
    }),

  staleElement: (elementId) =>
    new AppError(`Element '${elementId}' reference became stale.`, {
      code: 'STALE_ELEMENT_REFERENCE',
      status: 409,
      suggestion: 'The DOM changed. Retrying with fresh lookup or waiting for stability is recommended.',
      details: { elementId },
    }),

  timeout: (message, details) =>
    new AppError(message || 'Operation timed out.', {
      code: 'TIMEOUT',
      status: 408,
      suggestion: 'Increase timeout, ensure network is stable, or wait for the element/page to load.',
      details,
    }),

  invalidAction: (action) =>
    new AppError(`Unsupported action: ${action}`, {
      code: 'INVALID_ACTION',
      status: 400,
      suggestion: 'Refer to documentation for supported actions and payload schema.',
      details: { action },
    }),
};
