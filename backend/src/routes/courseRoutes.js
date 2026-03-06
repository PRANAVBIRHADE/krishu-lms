import express from 'express';
import { getCourses, createCourse, getCourseById, createLesson } from '../controllers/courseController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, admin, createCourse);

router.route('/:id')
    .get(protect, getCourseById);

router.route('/:id/lessons')
    .post(protect, admin, createLesson);

export default router;
