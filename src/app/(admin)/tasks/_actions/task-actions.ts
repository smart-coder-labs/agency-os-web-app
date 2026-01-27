'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  createTaskInDb, 
  updateTaskInDb, 
  deleteTaskInDb 
} from '@/lib/dal/tasks.dal'
import { type FormState } from '@/app/(admin)/projects/_actions/project-actions' // Reusing the same state type

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
  const validatedFields = CreateTaskSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create task.',
    }
  }

  let taskId = '';
  try {
    const newTask = await createTaskInDb(validatedFields.data);
    taskId = newTask.id;
  } catch (error) {
    return { message: 'Database Error: Failed to create task.' }
  }

  revalidatePath('/admin/tasks');
  revalidatePath(`/admin/projects/${validatedFields.data.project_id}`);
  redirect(`/admin/tasks/${taskId}`);
}


export async function updateTask(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = UpdateTaskSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update task.',
    };
  }

  const { id, ...data } = validatedFields.data;

  try {
    await updateTaskInDb(id, data);
  } catch (error) {
    return { message: 'Database Error: Failed to update task.' };
  }

  revalidatePath(`/admin/tasks/${id}`);
  revalidatePath('/admin/tasks');
  revalidatePath(`/admin/projects/${data.project_id}`);
  redirect(`/admin/tasks/${id}`);
}


export async function deleteTask(formData: FormData) {
    const id = formData.get('id')?.toString();
    const projectId = formData.get('project_id')?.toString(); // Need project_id for revalidation

    if (!id || !projectId) {
        throw new Error('ID and Project ID are required for deletion.');
    }

    try {
        await deleteTaskInDb(id);
    } catch (error) {
        throw new Error('Database Error: Failed to delete task.');
    }

    revalidatePath('/admin/tasks');
    revalidatePath(`/admin/projects/${projectId}`);
    redirect('/admin/tasks');
}
