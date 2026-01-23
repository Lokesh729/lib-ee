import express from 'express';
import { getLogs, clearLogs, exportLogs } from '../controllers/libraryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs', authMiddleware, getLogs);
router.delete('/logs', authMiddleware, clearLogs);
router.get('/export', authMiddleware, exportLogs);

export default router;
