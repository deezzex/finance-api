import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prismaClient.ts';
import { config } from '../config/index.ts';
import { ConflictError, UnauthorizedError } from '../errors/AppError.ts';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.ts';
import type { Role } from '../types/role.ts';

const SALT_ROUND = 12;
const DUMMY_HASH = await bcrypt.hash('no-such-user', SALT_ROUND);

export async function registerUser({ email, password}: RegisterInput) {
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if(existing) {
        throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUND);

    const user = await prisma.user.create({
        data: { email, passwordHash }
    });

    return { id: user.id, email: user.email, createdAt: user.createdAt }
}

export async function loginUser({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if(!user || !passwordMatches) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign({ sub: user.id, role: user.role as Role }, config.JWT_PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: '1h'
    });

    return { token };
}