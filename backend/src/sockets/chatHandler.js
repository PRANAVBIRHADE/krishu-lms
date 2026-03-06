import { prisma } from '../../server.js';

export const chatHandler = (io, socket) => {
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

    // Handle disconnection is automatic, but we can hook into it
    socket.on('disconnect', () => {
        // console.log('User disconnected:', socket.id);
    });
};
