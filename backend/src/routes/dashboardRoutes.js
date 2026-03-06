import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDashboardData);
router.route('/announcements')
    .get(protect, getAnnouncements)
    .post(protect, admin, createAnnouncement);

export default router;
