import { prisma } from '../../server.js';

// @desc    Get all announcements
// @route   GET /api/dashboard/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new announcement
// @route   POST /api/dashboard/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                message
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
