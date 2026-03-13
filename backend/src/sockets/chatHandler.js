import { prisma } from '../../server.js';

// Phase 6: Store active users: userId -> socketId
const activeUsers = new Map();

export const chatHandler = (io, socket) => {
    
    // Register User for Private Messaging
    socket.on('register_user', (userId) => {
        if (userId) {
            activeUsers.set(userId, socket.id);
        }
    });

    // Join a specific course/global chat room
    socket.on('join_room', async (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);

        try {
            const previousMessages = await prisma.chatMessage.findMany({
                take: 50,
                orderBy: { timestamp: 'asc' },
                include: { sender: { select: { name: true, role: true } } }
            });
            socket.emit('previous_messages', previousMessages);
        } catch (error) {
            console.error('Failed to fetch previous messages', error);
        }
    });

    // Handle incoming chat messages
    socket.on('send_message', async (data) => {
        try {
            // data: { room, senderId, message, isAnnouncement }
            const { room, senderId, message, isAnnouncement } = data;

            // Save message to database
            const savedMessage = await prisma.chatMessage.create({
                data: {
                    senderId,
                    message,
                    isAnnouncement: isAnnouncement || false,
                },
                include: {
                    sender: { select: { name: true, role: true } }
                }
            });

            // Broadcast to everyone in the room
            io.to(room).emit('receive_message', savedMessage);

            // Also emit a notification if it's an announcement
            if (isAnnouncement) {
                io.emit('new_announcement', savedMessage);
            }
        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    // Handle incoming chat deletions (from Admin API)
    socket.on('delete_message_broadcast', (data) => {
        const { room, messageId } = data;
        io.to(room).emit('message_deleted', messageId);
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
        // Find and remove the user from activeUsers map
        for (let [userId, mappedSocketId] of activeUsers.entries()) {
            if (mappedSocketId === socket.id) {
                activeUsers.delete(userId);
                break;
            }
        }
    });

    // --- PHASE 6: Private Messaging ---
    socket.on('private_message', async (data) => {
        const { senderId, receiverId, message } = data;

        try {
            // Save to database
            const savedMessage = await prisma.directMessage.create({
                data: {
                    senderId,
                    receiverId,
                    message,
                },
                include: {
                    sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
                    receiver: { select: { id: true, name: true, avatarUrl: true, role: true } }
                }
            });

            // Emit to receiver if online
            const receiverSocketId = activeUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_private_message', savedMessage);
            }

            // Emit back to sender so their UI updates instantly
            socket.emit('receive_private_message', savedMessage);

        } catch (error) {
            console.error('Error saving private message:', error);
            socket.emit('message_error', 'Failed to send message');
        }
    });
};
