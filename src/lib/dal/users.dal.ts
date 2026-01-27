import { prisma } from '@/lib/db';
import { z } from 'zod';

// --- SCHEMAS ---
const UserSchema = z.object({
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string().optional(),
});

export type UserFormData = z.infer<typeof UserSchema>;

// --- READ OPERATIONS ---
export async function getUsers() {
  try {
    return await prisma.users.findMany({ orderBy: { created_at: 'desc' } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.users.findUnique({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.users.findUnique({ where: { email } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getUsersCount() {
  try {
    return await prisma.users.count();
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user count.');
  }
}

// --- WRITE OPERATIONS ---
export async function createUserInDb(data: UserFormData) {
  try {
    return await prisma.users.create({ data });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create user.');
  }
}
