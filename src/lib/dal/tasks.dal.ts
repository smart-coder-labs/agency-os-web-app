import { prisma } from '@/lib/db';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

// --- SCHEMAS ---
const TaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional().default(''),
  type: z.string(), // This field is required
  priority: z.number().int().min(1).max(5).optional().default(1),
  status: z.string().optional().default('TODO'),
  project_id: z.string(),
});

export type TaskFormData = z.infer<typeof TaskSchema>;

// --- READ OPERATIONS ---
export async function getTasks() {
  const user = await currentUser();
  if (!user) return [];

  try {
    return await prisma.tasks.findMany({
      where: {
        projects: {
          user_id: user.id
        }
      },
      orderBy: { created_at: 'desc' },
      include: {
        projects: true,
        execution_logs: {
          orderBy: { created_at: 'desc' },
          include: {
            agents: true,
            tools: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tasks.');
  }
}

export async function getTaskById(id: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: { projects: true, execution_logs: true }
    });

    if (task && task.projects && task.projects.user_id !== user.id) {
      return null;
    }

    return task;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch task.');
  }
}

export async function getTasksByProjectId(projectId: string) {
  const user = await currentUser();
  if (!user) return [];

  try {
    return await prisma.tasks.findMany({
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
    throw new Error('Failed to fetch tasks for project.');
  }
}

export async function getTasksCount() {
  const user = await currentUser();
  if (!user) return 0;

  try {
    return await prisma.tasks.count({
      where: {
        projects: {
          user_id: user.id
        }
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tasks count.');
  }
}

export async function countTasksByProjectId(projectId: string) {
  const user = await currentUser();
  if (!user) return 0;

  try {
    return await prisma.tasks.count({
      where: {
        project_id: projectId,
        projects: {
          user_id: user.id
        }
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to count tasks for project.');
  }
}

export async function countCompletedTasksByProjectId(projectId: string) {
  const user = await currentUser();
  if (!user) return 0;

  try {
    return await prisma.tasks.count({
      where: {
        project_id: projectId,
        status: 'DONE',
        projects: {
          user_id: user.id
        }
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to count completed tasks for project.');
  }
}


// --- WRITE OPERATIONS ---
export async function createTaskInDb(data: TaskFormData) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Verify project belongs to user
    const project = await prisma.projects.findUnique({ where: { id: data.project_id } });
    if (!project || project.user_id !== user.id) throw new Error('Forbidden');

    return await prisma.tasks.create({ data });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create task.');
  }
}

export async function updateTaskInDb(id: string, data: Partial<TaskFormData>) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership through project relation
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: { projects: true }
    });
    if (!task || (task.projects && task.projects.user_id !== user.id)) throw new Error('Forbidden');

    return await prisma.tasks.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update task.');
  }
}

export async function deleteTaskInDb(id: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check ownership
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: { projects: true }
    });
    if (!task || (task.projects && task.projects.user_id !== user.id)) throw new Error('Forbidden');

    return await prisma.tasks.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete task.');
  }
}
