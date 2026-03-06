import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin100', 10);

        const user = await prisma.user.upsert({
            where: { email: 'admin100@gmail.com' },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'Master Admin'
            },
            create: {
                name: 'Master Admin',
                email: 'admin100@gmail.com',
                password: hashedPassword,
                role: 'ADMIN',
                grade: 8
            }
        });

        console.log(`\n🎉 Successfully provisioned Admin Account!`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}\n`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
