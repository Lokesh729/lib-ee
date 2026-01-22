import express from 'express';
import { getLogs, clearLogs } from '../controllers/libraryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs', authMiddleware, getLogs);
router.delete('/logs', authMiddleware, clearLogs);

export default router;
