import pino from 'pino';
import { config } from '../config/index.js';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
});

export const logger = pino(
  {
    level: config.logging.level,
    base: {
      env: config.server.nodeEnv,
    },
  },
  transport
);

export const createChildLogger = (context) => {
  return logger.child({ context });
}; 