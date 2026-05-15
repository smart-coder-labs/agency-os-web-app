'use server'
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

const ApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    key: z.string().min(1, 'Key is required'),
});

export type ApiKeyFormData = z.infer<typeof ApiKeySchema>;

export async function getApiKeys() {
    const user = await currentUser();
    if (!user) return [];

    try {
        return await prisma.api_keys.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch API keys.');
    }
}

export async function createApiKey(data: ApiKeyFormData) {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await prisma.api_keys.create({
            data: {
                ...data,
                user_id: user.id,
            },
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create API key.');
    }
}

export async function deleteApiKey(id: string) {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Check ownership
        const apiKey = await prisma.api_keys.findUnique({ where: { id } });
        if (!apiKey || apiKey.user_id !== user.id) throw new Error('Forbidden');

        return await prisma.api_keys.delete({
            where: { id },
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete API key.');
    }
}

export async function toggleApiKeyStatus(id: string, is_active: boolean) {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Check ownership
        const apiKey = await prisma.api_keys.findUnique({ where: { id } });
        if (!apiKey || apiKey.user_id !== user.id) throw new Error('Forbidden');

        return await prisma.api_keys.update({
            where: { id },
            data: { is_active },
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update API key status.');
    }
}
