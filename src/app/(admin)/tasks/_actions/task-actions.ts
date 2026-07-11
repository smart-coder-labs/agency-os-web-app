'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createTaskInDb,
  updateTaskInDb,
  deleteTaskInDb,
  getTaskById,
} from '@/lib/dal/tasks.dal'
import { getProjectById } from '@/lib/dal/projects.dal'
import { currentUser } from '@/lib/auth'
import { type FormState } from '@/app/(admin)/projects/_actions/project-actions'
export type { FormState }

// --- Schemas ---
const TaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional().default(''),
  type: z.string(),
  priority: z.coerce.number().int().min(1).max(5),
  status: z.string(),
  project_id: z.string(),
});

const CreateTaskSchema = TaskSchema;
const UpdateTaskSchema = TaskSchema.extend({ id: z.string() });

// --- Actions ---

export async function createTask(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = CreateTaskSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create task.',
    }
  }

  const project = await getProjectById(validatedFields.data.project_id);
  if (!project) return { message: 'Project not found.' };
  if (project.user_id && project.user_id !== user.id) return { message: 'Not authorized.' };

  let taskId = '';
  try {
    const newTask = await createTaskInDb(validatedFields.data);
    taskId = newTask.id;
  } catch (error) {
    return { message: 'Database Error: Failed to create task.' }
  }

  revalidatePath('/tasks');
  revalidatePath(`/projects/${validatedFields.data.project_id}`);
  redirect(`/tasks/${taskId}`);
}


export async function updateTask(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = UpdateTaskSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update task.',
    };
  }

  const { id, ...data } = validatedFields.data;

  const task = await getTaskById(id);
  if (!task) return { message: 'Task not found.' };
  if (!task.project_id) return { message: 'Task has no associated project.' };
  const project = await getProjectById(task.project_id);
  if (!project) return { message: 'Project not found.' };
  if (project.user_id && project.user_id !== user.id) return { message: 'Not authorized.' };

  try {
    await updateTaskInDb(id, data);
  } catch (error) {
    return { message: 'Database Error: Failed to update task.' };
  }

  revalidatePath(`/tasks/${id}`);
  revalidatePath('/tasks');
  revalidatePath(`/projects/${data.project_id}`);
  redirect(`/tasks/${id}`);
}


export async function deleteTask(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated.');

    const id = formData.get('id')?.toString();
    const projectId = formData.get('project_id')?.toString();

    if (!id || !projectId) {
        throw new Error('ID and Project ID are required for deletion.');
    }

    const project = await getProjectById(projectId);
    if (!project) throw new Error('Project not found.');
    if (project.user_id && project.user_id !== user.id) throw new Error('Not authorized.');

    try {
        await deleteTaskInDb(id);
    } catch (error) {
        throw new Error('Database Error: Failed to delete task.');
    }

    revalidatePath('/tasks');
    revalidatePath(`/projects/${projectId}`);
    redirect('/tasks');
}

export async function deleteTaskById(id: string): Promise<void> {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated.');

    const task = await getTaskById(id);
    if (!task) throw new Error('Task not found.');
    if (!task.project_id) throw new Error('Task has no associated project.');
    const project = await getProjectById(task.project_id);
    if (!project) throw new Error('Project not found.');
    if (project.user_id && project.user_id !== user.id) throw new Error('Not authorized.');

    await deleteTaskInDb(id);
    revalidatePath('/tasks');
    redirect('/tasks');
}
