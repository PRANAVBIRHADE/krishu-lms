import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
    {
        name: 'First Blood',
        description: 'Completed your first graded assignment.',
        icon: 'Award', // Lucide icon name
        criteria: 'first_blood'
    },
    {
        name: 'Code Ninja',
        description: 'Reached Level 5 in Happy Hackers.',
        icon: 'Shield',
        criteria: 'level_5'
    },
    {
        name: 'Star Student',
        description: 'Earned a 100/100 grade on an assignment.',
        icon: 'Star',
        criteria: 'perfect_grade'
    }
];

async function seedBadges() {
    try {
        console.log('Seeding initial gamification badges...');
        for (const badge of badges) {
            await prisma.badge.upsert({
                where: { name: badge.name },
                update: {},
                create: badge
            });
        }
        console.log('Badges seeded successfully!');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

seedBadges();
