import { prisma } from '@/lib/db';
import { z } from 'zod';

// --- SCHEMAS ---
const ProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  repo_path: z.string().optional(),
  github_path: z.string().optional(),
  status: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof ProjectSchema>;

// --- READ OPERATIONS ---
export async function getProjects() {
  try {
    return await prisma.projects.findMany({
      orderBy: { created_at: 'desc' },
      include: { tasks: true, project_artifacts: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function getProjectById(id: string) {
  try {
    return await prisma.projects.findUnique({
      where: { id },
      include: { tasks: true, user_stories: true, project_artifacts: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project.');
  }
}

export async function getProjectsCount() {
  try {
    return await prisma.projects.count();
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project count.');
  }
}

// --- WRITE OPERATIONS ---
export async function createProjectInDb(data: Omit<ProjectFormData, 'status'>) {
  try {
    return await prisma.projects.create({
      data: {
        ...data,
        status: 'DISCOVERY',
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create project.');
  }
}

export async function updateProjectInDb(id: string, data: ProjectFormData) {
  try {
    return await prisma.projects.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update project.');
  }
}

export async function deleteProjectInDb(id: string) {
  try {
    return await prisma.projects.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete project.');
  }
}
