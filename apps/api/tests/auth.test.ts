import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma/client';
import { createUser } from './helpers/factories';

const app = createApp();

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('stores a bcrypt hash, never plaintext password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'hash@test.com', password: 'plaintext' });

    const row = await prisma.user.findUnique({ where: { email: 'hash@test.com' } });
    expect(row!.passwordHash).not.toBe('plaintext');
    expect(row!.passwordHash).toMatch(/^\$2[ab]\$/);
  });

  it('returns 409 on duplicate email', async () => {
    await createUser('dup@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: 'abc' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createUser('login@test.com', 'correct-password');
  });

  it('returns 200 with accessToken on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('sets httpOnly refreshToken cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'correct-password' });

    const cookie = res.headers['set-cookie'] as unknown as string[];
    expect(cookie.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookie.some((c: string) => c.includes('HttpOnly'))).toBe(true);
  });

  it('returns 401 for wrong password (not 500)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email (not 404, prevents user enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns new accessToken when valid refreshToken cookie is present', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh@test.com', password: 'password123' });

    // Need a user first
    await createUser('refresh@test.com', 'password123');
    const loginRes2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh@test.com', password: 'password123' });

    const cookie = (loginRes2.headers['set-cookie'] as unknown as string[]).find((c: string) =>
      c.startsWith('refreshToken='),
    )!;

    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('returns 401 with no refresh cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('Protected routes', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('returns 401 with expired token', async () => {
    const jwt = await import('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: 'test', tenantId: 'test' },
      process.env.JWT_SECRET ?? 'test-jwt-secret',
      { expiresIn: '0s' },
    );

    await new Promise((r) => setTimeout(r, 10));

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('returns 401 with valid JWT but wrong secret', async () => {
    const jwt = await import('jsonwebtoken');
    const badToken = jwt.sign({ userId: 'test', tenantId: 'test' }, 'wrong-secret');

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });
});
