import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

// --- Load config from JSON file if MCP_SERVER_CONFIG is set ---
let fileConfig = {};
const configPath = process.env.MCP_SERVER_CONFIG;

if (configPath && fs.existsSync(configPath)) {
  try {
    const rawdata = fs.readFileSync(configPath);
    fileConfig = JSON.parse(rawdata);
  } catch (error) {
    console.error(`[MCP-Server-Config] Error reading or parsing config file at ${configPath}:`, error);
  }
}

// --- Define default configuration ---
const defaultConfig = {
  server: {
    port: 3000,
    nodeEnv: 'development',
  },
  logging: {
    level: 'info',
  },
  session: {
    timeoutMs: 600000, // 10 minutes
  },
  browser: {
    type: 'chrome',
    headless: false,
    timeout: 30000,
  },
  security: {
    rateLimitWindowMs: 900000, // 15 minutes
    rateLimitMaxRequests: 100,
  },
};

// --- Merge configurations: default < fileConfig < environment variables ---
export const config = {
  server: {
    port: parseInt(process.env.PORT) || fileConfig.server?.port || defaultConfig.server.port,
    nodeEnv: process.env.NODE_ENV || fileConfig.server?.nodeEnv || defaultConfig.server.nodeEnv,
  },
  logging: {
    level: process.env.LOG_LEVEL || fileConfig.logging?.level || defaultConfig.logging.level,
  },
  session: {
    timeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS) || fileConfig.session?.timeoutMs || defaultConfig.session.timeoutMs,
  },
  browser: {
    type: process.env.BROWSER || fileConfig.browser?.type || defaultConfig.browser.type,
    headless: process.env.BROWSER_HEADLESS !== undefined ? process.env.BROWSER_HEADLESS === 'true' : (fileConfig.browser?.headless ?? defaultConfig.browser.headless),
    timeout: parseInt(process.env.BROWSER_TIMEOUT) || fileConfig.browser?.timeout || defaultConfig.browser.timeout,
  },
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || fileConfig.security?.rateLimitWindowMs || defaultConfig.security.rateLimitWindowMs,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || fileConfig.security?.rateLimitMaxRequests || defaultConfig.security.rateLimitMaxRequests,
  },
};
