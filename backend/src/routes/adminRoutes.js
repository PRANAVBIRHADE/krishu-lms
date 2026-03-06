import express from 'express';
import { getAdminDashboard, getPendingSubmissions, getAllUsers, deleteUser, resetUserPassword, deleteChatMessage } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Admin middleware validation
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const router = express.Router();

router.get('/dashboard', protect, adminAuth, getAdminDashboard);
router.get('/submissions/pending', protect, adminAuth, getPendingSubmissions);
router.get('/users', protect, adminAuth, getAllUsers);
router.delete('/users/:id', protect, adminAuth, deleteUser);
router.post('/users/:id/reset-password', protect, adminAuth, resetUserPassword);

// Moderation
router.delete('/chat/:id', protect, adminAuth, deleteChatMessage);

export default router;
