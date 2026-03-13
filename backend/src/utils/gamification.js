import { prisma } from '../../server.js';

export const XP_PER_LEVEL = 100;

export async function checkAndApplyGamification(userId) {
    // Fetch user and current badges
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { badges: true, submissions: { where: { grade: { not: null } } } }
    });

    if (!user) return;

    // 1. Calculate Level Update
    const expectedLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;
    if (expectedLevel > user.level) {
        await prisma.user.update({
            where: { id: userId },
            data: { level: expectedLevel }
        });
    }

    // 2. Check for "first_blood" badge (First graded assignment)
    if (user.submissions.length > 0) {
        await awardBadge(userId, 'first_blood');
    }

    // 3. Check for perfect grade
    const hasPerfectGrade = user.submissions.some(sub => sub.grade === 100);
    if (hasPerfectGrade) {
        await awardBadge(userId, 'perfect_grade');
    }

    // 4. Check for Level 5 Ninja
    if (expectedLevel >= 5) {
        await awardBadge(userId, 'level_5');
    }
}

export async function awardBadge(userId, badgeCriteria) {
    // Find the badge ID by criteria
    const badge = await prisma.badge.findFirst({
        where: { criteria: badgeCriteria }
    });

    if (!badge) return; // Badge not exists

    // Check if user already has it
    const existingUserBadge = await prisma.userBadge.findUnique({
        where: {
            userId_badgeId: {
                userId,
                badgeId: badge.id
            }
        }
    });

    if (!existingUserBadge) {
        await prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id
            }
        });
    }
}
