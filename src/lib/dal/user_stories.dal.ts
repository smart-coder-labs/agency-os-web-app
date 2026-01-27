import { prisma } from '@/lib/db';
import { z } from 'zod';

// --- SCHEMAS ---
const StorySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  role: z.string().optional(),
  goal: z.string().optional(),
  benefit: z.string().optional(),
  acceptance_criteria: z.any().optional(), // Prisma expects Json, Zod handles it as 'any'
  priority: z.string().optional(),
  status: z.string().optional().default('PENDING'),
  project_id: z.string(),
});

export type StoryFormData = z.infer<typeof StorySchema>;


// --- READ OPERATIONS ---
export async function getStories() {
  try {
    return await prisma.user_stories.findMany({
      orderBy: { created_at: 'desc' },
      include: { projects: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user stories.');
  }
}

export async function getStoryById(id: string) {
  try {
    return await prisma.user_stories.findUnique({
      where: { id },
      include: { projects: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user story.');
  }
}

export async function getStoriesByProjectId(projectId: string) {
  try {
    return await prisma.user_stories.findMany({ 
      where: { project_id: projectId }, 
      orderBy: { created_at: 'desc' } 
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user stories for project.');
  }
}

// --- WRITE OPERATIONS ---
export async function createStoryInDb(data: StoryFormData) {
  try {
    return await prisma.user_stories.create({ data });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create user story.');
  }
}

export async function updateStoryInDb(id: string, data: Partial<StoryFormData>) {
  try {
    return await prisma.user_stories.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update user story.');
  }
}

export async function deleteStoryInDb(id: string) {
  try {
    return await prisma.user_stories.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete user story.');
  }
}
