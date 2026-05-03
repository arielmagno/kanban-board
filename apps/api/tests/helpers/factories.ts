import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/prisma/client';

export async function createUser(email = 'test@test.com', password = 'password123') {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, tenantId: true, passwordHash: true },
  });
}

export function loginAs(user: { id: string; tenantId: string }): string {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenantId },
    process.env.JWT_SECRET ?? 'test-jwt-secret',
    { expiresIn: '15m' },
  );
}

export async function createBoard(token: string, title = 'Test Board') {
  const { default: request } = await import('supertest');
  const { createApp } = await import('../../src/app');
  const app = createApp();
  const res = await request(app)
    .post('/api/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ title });
  return res.body;
}
