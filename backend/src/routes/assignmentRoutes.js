import express from 'express';
import { createAssignment, getAssignmentsByLesson, submitAssignment, gradeSubmission } from '../controllers/assignmentController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, admin, createAssignment);

router.route('/lesson/:lessonId')
    .get(protect, getAssignmentsByLesson);

router.route('/:id/submit')
    .post(protect, upload.single('document'), submitAssignment);

router.route('/submissions/:id/grade')
    .post(protect, admin, gradeSubmission);

export default router;
