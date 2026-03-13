import { prisma } from '../../server.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, grade } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                grade: grade ? parseInt(grade) : null,
            },
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                level: user.level,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                courses: [],
                badges: [],
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                level: user.level,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                // Optional: we can fetch their courses here or keep it simple
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        // req.user is populated by protect middleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { 
                id: true, name: true, email: true, role: true, grade: true, 
                xp: true, level: true, avatarUrl: true, bio: true, courses: true,
                badges: {
                    include: { badge: true }
                } 
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { bio, avatarUrl } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                bio: bio !== undefined ? bio : undefined,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
            },
            select: { 
                id: true, name: true, email: true, role: true, 
                xp: true, level: true, avatarUrl: true, bio: true 
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
