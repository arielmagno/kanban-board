import { prisma } from '../../src/prisma/client';

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE "Card", "Lane", "Board", "User" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
