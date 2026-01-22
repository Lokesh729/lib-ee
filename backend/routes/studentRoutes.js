import express from 'express';
import { getStudentByEnrollment } from '../controllers/studentController.js';

const router = express.Router();

router.get('/:enrollment', getStudentByEnrollment);

export default router;
