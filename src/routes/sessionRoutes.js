import express from 'express';
import { 
  startSession, 
  executeAction, 
  terminateSession, 
  getStats 
} from '../controllers/sessionController.js';
import { 
  validateRequest, 
  sessionStartSchema, 
  actionSchema 
} from '../utils/validation.js';

const router = express.Router();

/**
 * @route POST /session/start
 * @desc Start a new browser session
 * @access Public
 */
router.post('/start', validateRequest(sessionStartSchema), startSession);

/**
 * @route POST /session/:sessionId/act
 * @desc Execute an action within a session
 * @access Public
 */
router.post('/:sessionId/act', validateRequest(actionSchema), executeAction);

/**
 * @route DELETE /session/:sessionId
 * @desc Terminate a session
 * @access Public
 */
router.delete('/:sessionId', terminateSession);

/**
 * @route GET /session/stats
 * @desc Get session statistics
 * @access Public
 */
router.get('/stats', getStats);

export default router; 