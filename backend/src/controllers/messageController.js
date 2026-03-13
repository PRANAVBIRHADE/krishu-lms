import { prisma } from '../../server.js';

// @desc    Get all users the current user has messaged (Unique list)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch DMs where user is sender or receiver
        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
                receiver: { select: { id: true, name: true, avatarUrl: true, role: true } }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Extract unique conversational partners
        const partnersMap = new Map();
        
        messages.forEach(msg => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!partnersMap.has(partner.id)) {
                partnersMap.set(partner.id, {
                    user: partner,
                    lastMessage: msg.message,
                    timestamp: msg.timestamp,
                    unread: msg.receiverId === userId && !msg.read
                });
            }
        });

        const conversations = Array.from(partnersMap.values());
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get chat history with a specific user
// @route   GET /api/messages/:partnerId
// @access  Private
export const getMessageHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const partnerId = req.params.partnerId;

        // Mark unread messages from this partner as read
        await prisma.directMessage.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                read: false
            },
            data: { read: true }
        });

        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            },
            orderBy: { timestamp: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching message history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Search for users to start a new conversation
// @route   GET /api/messages/search?q=name
// @access  Private
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await prisma.user.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' },
                id: { not: req.user.id } // exclude self
            },
            select: { id: true, name: true, avatarUrl: true, role: true },
            take: 10
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
