import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully made ${user.name} (${user.email}) an ADMIN!`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`User with email ${email} not found.`);
        } else {
            console.error('Error updating user:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Please provide the email address of the account you want to make an admin.');
    console.log('Usage: node makeAdmin.js <email>');
    process.exit(1);
}

makeAdmin(args[0]);
