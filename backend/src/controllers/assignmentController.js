import { prisma } from '../../server.js';
import { checkAndApplyGamification } from '../utils/gamification.js';

// @desc    Create an assignment
// @route   POST /api/assignments
// @access  Private/Admin
export const createAssignment = async (req, res) => {
    try {
        const { lessonId, deadline, instructions } = req.body;

        const assignment = await prisma.assignment.create({
            data: {
                lessonId,
                deadline: new Date(deadline),
                instructions,
            },
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get assignments for a lesson
// @route   GET /api/assignments/lesson/:lessonId
// @access  Private
export const getAssignmentsByLesson = async (req, res) => {
    try {
        const assignments = await prisma.assignment.findMany({
            where: { lessonId: req.params.lessonId },
            include: {
                submissions: {
                    include: {
                        student: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });

        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private
export const submitAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const studentId = req.user.id;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!fileUrl) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // --- PHASE 5: Strict Deadline Enforcement ---
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (new Date() > assignment.deadline) {
            return res.status(400).json({
                message: 'This assignment is past its deadline and is no longer accepting submissions.'
            });
        }
        // --------------------------------------------

        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                fileUrl,
            },
        });

        // Add 50 XP for submitting
        await prisma.user.update({
            where: { id: studentId },
            data: { xp: { increment: 50 } }
        });

        // Check for level ups and badges
        await checkAndApplyGamification(studentId);

        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Grade a submission
// @route   POST /api/assignments/submissions/:id/grade
// @access  Private/Admin
export const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await prisma.submission.update({
            where: { id: req.params.id },
            data: {
                grade: parseInt(grade),
                feedback,
            },
        });

        if (grade) {
            await prisma.user.update({
                where: { id: submission.studentId },
                data: { xp: { increment: parseInt(grade) * 10 } }
            });
            // Re-calculate gamification
            await checkAndApplyGamification(submission.studentId);
        }

        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
