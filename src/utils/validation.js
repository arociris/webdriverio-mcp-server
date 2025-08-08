import Joi from 'joi';

export const sessionStartSchema = Joi.object({
  url: Joi.string().uri(),
  browserOptions: Joi.object({
    headless: Joi.boolean().default(true),
    timeout: Joi.number().integer().min(1000).max(120000).default(30000),
    windowSize: Joi.object({
      width: Joi.number().integer().min(800).max(2560).default(1920),
      height: Joi.number().integer().min(600).max(1600).default(1080),
    }).default(),
  }).default(),
  mobile: Joi.object({
    enabled: Joi.boolean().default(false),
    platformName: Joi.string().valid('Android', 'iOS').required(),
    deviceName: Joi.string().required(),
    platformVersion: Joi.string(),
    app: Joi.string(),
    browserName: Joi.string().valid('Chrome', 'Safari'),
    automationName: Joi.string(),
    appPackage: Joi.string(),
    appActivity: Joi.string(),
    udid: Joi.string(),
    noReset: Joi.boolean(),
    fullReset: Joi.boolean(),
    language: Joi.string(),
    locale: Joi.string(),
    newCommandTimeout: Joi.number().integer(),
    otherCaps: Joi.object(),
  }),
});

export const actionSchema = Joi.object({
  action: Joi.string().valid(
    'click',
    'setValue',
    'getText',
    'clearValue',
    'selectByVisibleText',
    'selectByIndex',
    'selectByAttribute',
    'keys',
    'scrollIntoView',
    'screenshot',
    'navigate',
    'getAttribute',
    'isDisplayed',
    'isEnabled',
    'isSelected',
    'waitForDisplayed',
    'waitForEnabled',
    'waitForExist',
    'customScript',
    // Mobile specific
    'mobile:tap',
    'mobile:swipe',
    'mobile:scroll',
    'mobile:back',
    'mobile:pressKey',
    'mobile:hideKeyboard'
  ).required(),
  elementId: Joi.string(),
  value: Joi.string(),
  text: Joi.string(),
  index: Joi.number().integer(),
  attribute: Joi.string(),
  url: Joi.string().uri(),
  script: Joi.string(),
  args: Joi.array(),
  timeout: Joi.number().integer(),
  // Mobile action params
  x: Joi.number(),
  y: Joi.number(),
  direction: Joi.string().valid('up', 'down', 'left', 'right'),
  duration: Joi.number().integer(),
  key: Joi.string(),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errorDetails: error.details[0].message,
      });
    }
    req.validatedBody = value;
    next();
  };
}; 