import { prisma } from "../db/prismaClient.js";

const alice = await prisma.account.create({
    data: {
        ownerName: 'Alice',
        balance: 500,
        currency: 'USD'
    }
});

const bob = await prisma.account.create({
    data: {
        ownerName: 'Bob',
        balance: 100,
        currency: 'USD'
    }
});

console.log('Seeded accounts:');
console.log(alice);
console.log(bob);

await prisma.$disconnect();