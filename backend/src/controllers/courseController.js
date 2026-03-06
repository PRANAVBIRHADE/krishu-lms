import { prisma } from '../../server.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                lessons: true,
            },
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
    try {
        const { title, description, gradeLevel } = req.body;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                gradeLevel: parseInt(gradeLevel),
            },
        });

        res.status(201).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                lessons: {
                    include: {
                        assignments: {
                            include: {
                                submissions: {
                                    where: {
                                        studentId: req.user.id
                                    }
                                }
                            }
                        },
                    }
                },
            }
        });

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a lesson for a course
// @route   POST /api/courses/:id/lessons
// @access  Private/Admin
export const createLesson = async (req, res) => {
    try {
        const { title, content, meetLink, videoUrl } = req.body;
        const courseId = req.params.id;

        const lesson = await prisma.lesson.create({
            data: {
                title,
                content,
                meetLink,
                videoUrl,
                courseId,
            }
        });

        res.status(201).json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
