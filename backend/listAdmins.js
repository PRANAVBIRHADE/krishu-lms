import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true, role: true }
    });
    fs.writeFileSync('admins.json', JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}

listUsers();
