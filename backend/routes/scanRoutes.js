import express from 'express';
import { processScan } from '../controllers/scanController.js';

const router = express.Router();

router.post('/', processScan);

export default router;
