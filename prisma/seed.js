import { PrismaClient } from './generated/client.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('12345678', 10);

    const pedro = await prisma.user.create({
        data: {
            name: 'Pedro Barbosa',
            username: 'pedzero',
            email: 'pedzero@example.com',
            passwordHash,
        },
    });

    const john = await prisma.user.create({
        data: {
            name: 'John Doe',
            username: 'johndoe',
            email: 'johndoe@example.com',
            passwordHash,
        },
    });

    const jane = await prisma.user.create({
        data: {
            name: 'Jane Doe',
            username: 'janedoe',
            email: 'janedoe@example.com',
            passwordHash,
        },
    });

    await prisma.follow.createMany({
        data: [
            {
                followerId: pedro.id,
                followingId: john.id,
                status: 'ACCEPTED',
            },
            {
                followerId: john.id,
                followingId: jane.id,
                status: 'ACCEPTED',
            },
            {
                followerId: jane.id,
                followingId: john.id,
                status: 'ACCEPTED',
            },
            {
                followerId: jane.id,
                followingId: pedro.id,
                status: 'PENDING',
            },
        ],
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
