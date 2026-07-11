'use server'
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

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
  const user = await currentUser();
  if (!user) {
    return [];
  }

  try {
    return await prisma.projects.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      include: { tasks: true, project_artifacts: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function getProjectById(id: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const project = await prisma.projects.findUnique({
      where: { id },
      include: { tasks: true, user_stories: true, project_artifacts: true, ui_specs: true, project_briefs: true, architecture_specs: true }
    });

    if (project && project.user_id && project.user_id !== user.id) {
      console.error('Access denied for project', id, 'user', user.id);
      return null;
    }

    return project;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project.');
  }
}

export async function getProjectsCount() {
  const user = await currentUser();
  if (!user) return 0;

  try {
    return await prisma.projects.count({
      where: { user_id: user.id }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project count.');
  }
}

// --- WRITE OPERATIONS ---
export async function createProjectInDb(data: Omit<ProjectFormData, 'status'>) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    return await prisma.projects.create({
      data: {
        ...data,
        user_id: user.id,
        status: 'DISCOVERY',
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create project.');
  }
}

export async function updateProjectInDb(id: string, data: ProjectFormData) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership (null user_id = admin-created, skip check)
    const project = await prisma.projects.findUnique({ where: { id } });
    if (!project || (project.user_id && project.user_id !== user.id)) throw new Error('Forbidden');

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
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership (null user_id = admin-created, skip check)
    const project = await prisma.projects.findUnique({ where: { id } });
    if (!project || (project.user_id && project.user_id !== user.id)) throw new Error('Forbidden');

    return await prisma.projects.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete project.');
  }
}
