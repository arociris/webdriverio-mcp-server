import { v4 as uuidv4 } from 'uuid';
import { sessionManager } from '../services/sessionManager.js';
import { contextExtractor } from '../services/contextExtractor.js';
import { actionExecutor } from '../services/actionExecutor.js';
import { logger } from '../utils/logger.js';

const sessionLogger = logger.child({ context: 'SessionController' });

/**
 * Start a new browser session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const startSession = async (req, res) => {
  const { url, browserOptions } = req.validatedBody;
  const sessionId = uuidv4();

  try {
    sessionLogger.info({ sessionId, url }, 'Starting new session');

    // Create browser session
    const browser = await sessionManager.createSession(sessionId, url, browserOptions);

    // Extract initial context
    const { context } = await contextExtractor.extractContext(browser);

    sessionLogger.info({ sessionId, elementCount: context.interactiveElements.length }, 'Session started successfully');

    res.status(201).json({
      message: 'Session started successfully.',
      sessionId,
      context,
    });
  } catch (error) {
    sessionLogger.error({ sessionId, error: error.message }, 'Failed to start session');
    
    // Clean up session if creation failed
    await sessionManager.terminateSession(sessionId);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to start session',
      errorDetails: error.message,
    });
  }
};

/**
 * Execute an action within a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const executeAction = async (req, res) => {
  const { sessionId } = req.params;
  const action = req.validatedBody;

  try {
    sessionLogger.info({ sessionId, action }, 'Executing action');

    // Get session
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
        errorDetails: `Session with id '${sessionId}' was not found.`,
      });
    }

    // Extract current context and element map
    const { context: currentContext, elementMap } = await contextExtractor.extractContext(session.browser);

    // Execute the action
    const actionResult = await actionExecutor.executeAction(session.browser, action, elementMap);

    // Extract updated context after action
    const { context: updatedContext } = await contextExtractor.extractContext(session.browser);

    sessionLogger.info({ sessionId, action: action.action }, 'Action executed successfully');

    res.json({
      message: actionResult.message,
      sessionId,
      context: updatedContext,
      result: actionResult.result,
    });
  } catch (error) {
    sessionLogger.error({ sessionId, action, error: error.message }, 'Failed to execute action');

    res.status(400).json({
      status: 'error',
      message: 'Failed to execute action',
      errorDetails: error.message,
    });
  }
};

/**
 * Terminate a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const terminateSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    sessionLogger.info({ sessionId }, 'Terminating session');

    const terminated = await sessionManager.terminateSession(sessionId);
    
    if (!terminated) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
        errorDetails: `Session with id '${sessionId}' was not found.`,
      });
    }

    sessionLogger.info({ sessionId }, 'Session terminated successfully');

    res.json({
      message: 'Session terminated successfully.',
      status: 'terminated',
      sessionId,
    });
  } catch (error) {
    sessionLogger.error({ sessionId, error: error.message }, 'Failed to terminate session');

    res.status(500).json({
      status: 'error',
      message: 'Failed to terminate session',
      errorDetails: error.message,
    });
  }
};

/**
 * Get session statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStats = async (req, res) => {
  try {
    const stats = sessionManager.getStats();
    
    res.json({
      message: 'Session statistics fetched successfully.',
      status: 'success',
      stats,
    });
  } catch (error) {
    sessionLogger.error({ error: error.message }, 'Failed to get stats');

    res.status(500).json({
      status: 'error',
      message: 'Failed to get statistics',
      errorDetails: error.message,
    });
  }
}; 