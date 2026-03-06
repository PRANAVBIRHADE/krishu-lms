import cron from 'node-cron';
import { prisma } from '../../server.js';

export const startChatCleanupJob = () => {
    // Run every day at exactly midnight (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Starting routine Chat Cleanup...');
        try {
            // Calculate what date was exactly 48 hours ago
            const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // Delete all messages older than that date
            const result = await prisma.chatMessage.deleteMany({
                where: {
                    timestamp: {
                        lt: fortyEightHoursAgo
                    }
                }
            });

            console.log(`[CRON] Successfully deleted ${result.count} obsolete chat messages. Room purified.`);
        } catch (error) {
            console.error('[CRON] Failed to clear old chat messages:', error);
        }
    });
};
