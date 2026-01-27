import { prisma } from '@/lib/db';
import { z } from 'zod';

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
  try {
    return await prisma.tasks.findMany({ 
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
  try {
    // NOTE: The relation to user_stories does not exist on the task model.
    // To get this information, we'd need to query user_stories separately
    // if a link between them (e.g., a user_story_id on tasks) is established.
    return await prisma.tasks.findUnique({
      where: { id },
      include: { projects: true, execution_logs: true }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch task.');
  }
}

export async function getTasksByProjectId(projectId: string) {
  try {
    return await prisma.tasks.findMany({ 
      where: { project_id: projectId }, 
      orderBy: { created_at: 'desc' } 
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tasks for project.');
  }
}

export async function getTasksCount() {
    try {
        return await prisma.tasks.count();
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch tasks count.');
    }
}

export async function countTasksByProjectId(projectId: string) {
  try {
    return await prisma.tasks.count({ where: { project_id: projectId } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to count tasks for project.');
  }
}

export async function countCompletedTasksByProjectId(projectId: string) {
  try {
    return await prisma.tasks.count({ where: { project_id: projectId, status: 'DONE' } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to count completed tasks for project.');
  }
}


// --- WRITE OPERATIONS ---
export async function createTaskInDb(data: TaskFormData) {
  try {
    return await prisma.tasks.create({ data });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create task.');
  }
}

export async function updateTaskInDb(id: string, data: Partial<TaskFormData>) {
  try {
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
  try {
    return await prisma.tasks.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete task.');
  }
}
