import { prisma } from '../../server.js';
import bcrypt from 'bcrypt';

// @desc    Get Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
    try {
        // Active students
        const studentCount = await prisma.user.count({
            where: { role: 'STUDENT' }
        });

        // Top 5 students by XP
        const topStudents = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            orderBy: { xp: 'desc' },
            take: 5,
            select: { id: true, name: true, xp: true, grade: true }
        });

        // Submissions waiting for grading
        const pendingSubmissions = await prisma.submission.count({
            where: { grade: null }
        });

        res.json({
            studentCount,
            topStudents,
            pendingSubmissions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all ungraded submissions
// @route   GET /api/admin/submissions/pending
// @access  Private/Admin
export const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { grade: null },
            orderBy: { id: 'desc' }, // simple sort for now
            include: {
                student: { select: { id: true, name: true, email: true } },
                assignment: {
                    include: { lesson: { include: { course: true } } }
                }
            }
        });

        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users (students and admins)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, xp: true, grade: true },
            orderBy: { role: 'asc' }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting oneself
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
}

// @desc    Force reset a user's password to default 'happyhacker123'
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const defaultPassword = 'happyhacker123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: `Password successfully reset to: ${defaultPassword}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error resetting password' });
    }
}

// @desc    Admin manually deletes a chat message
// @route   DELETE /api/admin/chat/:id
// @access  Private/Admin
export const deleteChatMessage = async (req, res) => {
    try {
        const messageId = req.params.id;

        await prisma.chatMessage.delete({
            where: { id: messageId }
        });

        res.json({ message: 'Chat message explicitly deleted by Admin' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting message' });
    }
}
