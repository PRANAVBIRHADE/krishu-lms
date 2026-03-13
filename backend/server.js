import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import assignmentRoutes from './src/routes/assignmentRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { chatHandler } from './src/sockets/chatHandler.js';
import { startChatCleanupJob } from './src/jobs/chatCleanup.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Use a separate setup for socket to inject into the app/routes if needed
const io = new Server(httpServer, {
    cors: {
        origin: '*', // TODO: Update to frontend URL in production
    },
});

export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
    res.send('🚀 Happy Hackers LMS API is flying high!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    chatHandler(io, socket);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start background cron jobs
startChatCleanupJob();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
