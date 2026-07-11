import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;
export const prismaMock = mockDeep<PrismaClient>();

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

beforeEach(() => mockReset(prismaMock));
