import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { ConflictError, UnauthorizedError } from '../../errors';
import type { RegisterDto, LoginDto } from '@boardflow/shared';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function signAccess(userId: string, tenantId: string): string {
  return jwt.sign({ userId, tenantId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function signRefresh(userId: string, tenantId: string): string {
  return jwt.sign({ userId, tenantId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  const user = await prisma.user.create({
    data: { email: dto.email, fullName: dto.fullName, passwordHash },
    select: { id: true, email: true, fullName: true, tenantId: true },
  });

  return {
    accessToken: signAccess(user.id, user.tenantId),
    refreshToken: signRefresh(user.id, user.tenantId),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  // Constant-time comparison to avoid user enumeration via timing
  const dummyHash = '$2b$12$invalidhashforuserthatdoesnotexist000000000000000000000';
  const valid = await bcrypt.compare(dto.password, user?.passwordHash ?? dummyHash);
  if (!user || !valid) throw new UnauthorizedError('Invalid email or password');

  return {
    accessToken: signAccess(user.id, user.tenantId),
    refreshToken: signRefresh(user.id, user.tenantId),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

export async function refresh(token: string) {
  let payload: { userId: string; tenantId: string };
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as typeof payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, fullName: true, tenantId: true },
  });
  if (!user) throw new UnauthorizedError('User not found');

  return {
    accessToken: signAccess(user.id, user.tenantId),
    refreshToken: signRefresh(user.id, user.tenantId),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}
