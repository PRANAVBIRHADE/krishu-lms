import express from 'express';
import { getConversations, getMessageHistory, searchUsers } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/search', protect, searchUsers);
router.get('/:partnerId', protect, getMessageHistory);

export default router;
