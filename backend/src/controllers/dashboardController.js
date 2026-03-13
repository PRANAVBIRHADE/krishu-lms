import { prisma } from '../../server.js';

// @desc    Get dashboard summary data for a student
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User with their submissions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                submissions: {
                    include: {
                        assignment: {
                            include: { lesson: true }
                        }
                    }
                },
                badges: {
                    include: { badge: true }
                }
            }
        });

        // Fetch all courses with lesson counts
        const allCourses = await prisma.course.findMany({
            include: {
                lessons: {
                    include: { assignments: true }
                }
            }
        });

        // Calculate progress for courses the user has submissions in
        const courseProgress = [];

        allCourses.forEach(course => {
            let totalAssignments = 0;
            let completedAssignments = 0;

            // Count total assignments in course
            course.lessons.forEach(lesson => {
                totalAssignments += lesson.assignments.length;
            });

            // Count completed
            user.submissions.forEach(sub => {
                if (sub.assignment.lesson.courseId === course.id) {
                    completedAssignments++;
                }
            });

            // Only add to 'My Courses' if they have started or if total courses < 3 (so UI isn't empty)
            if (completedAssignments > 0 || courseProgress.length < 2) {
                let progress = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);

                courseProgress.push({
                    id: course.id,
                    title: course.title,
                    progress: progress > 100 ? 100 : progress,
                    completedAssignments,
                    totalAssignments
                });
            }
        });

        // Get upcoming live class (mocking this slightly by just picking the first lesson with a meetLink)
        const nextClassLesson = await prisma.lesson.findFirst({
            where: { meetLink: { not: null } },
            include: { course: true }
        });

        // Recent generic announcements
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        // Recent chat messages
        const recentChats = await prisma.chatMessage.findMany({
            orderBy: { timestamp: 'desc' },
            take: 3,
            include: { sender: { select: { name: true, role: true } } }
        });

        // Top Hackers Leaderboard
        const leaderboard = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            orderBy: [{ xp: 'desc' }, { level: 'desc' }],
            take: 5,
            select: { id: true, name: true, xp: true, level: true, avatarUrl: true }
        });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                xp: user.xp,
                level: user.level,
                avatarUrl: user.avatarUrl,
                badges: user.badges
            },
            courseProgress,
            nextClass: nextClassLesson ? {
                title: nextClassLesson.title,
                courseName: nextClassLesson.course.title,
                meetLink: nextClassLesson.meetLink
            } : null,
            announcements,
            recentChats: recentChats.reverse(),
            leaderboard
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
