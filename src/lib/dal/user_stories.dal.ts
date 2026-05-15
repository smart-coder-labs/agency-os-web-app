import { prisma } from '@/lib/db';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

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
  const user = await currentUser();
  if (!user) return [];

  try {
    return await prisma.user_stories.findMany({
      where: {
        projects: {
          user_id: user.id
        }
      },
      orderBy: { created_at: 'desc' },
      include: { projects: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user stories.');
  }
}

export async function getStoryById(id: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const story = await prisma.user_stories.findUnique({
      where: { id },
      include: { projects: true }
    });

    if (story && story.projects && story.projects.user_id !== user.id) {
      return null;
    }

    return story;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user story.');
  }
}

export async function getStoriesByProjectId(projectId: string) {
  const user = await currentUser();
  if (!user) return [];

  try {
    return await prisma.user_stories.findMany({
      where: {
        project_id: projectId,
        projects: {
          user_id: user.id
        }
      },
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user stories for project.');
  }
}

// --- WRITE OPERATIONS ---
export async function createStoryInDb(data: StoryFormData) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Verify project ownership
    const project = await prisma.projects.findUnique({ where: { id: data.project_id } });
    if (!project || project.user_id !== user.id) throw new Error('Forbidden');

    return await prisma.user_stories.create({ data });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create user story.');
  }
}

export async function updateStoryInDb(id: string, data: Partial<StoryFormData>) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership
    const story = await prisma.user_stories.findUnique({
      where: { id },
      include: { projects: true }
    });
    if (!story || (story.projects && story.projects.user_id !== user.id)) throw new Error('Forbidden');

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
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership
    const story = await prisma.user_stories.findUnique({
      where: { id },
      include: { projects: true }
    });
    if (!story || (story.projects && story.projects.user_id !== user.id)) throw new Error('Forbidden');

    return await prisma.user_stories.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete user story.');
  }
}
