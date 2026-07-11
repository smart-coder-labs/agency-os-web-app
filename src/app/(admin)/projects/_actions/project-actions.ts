'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createProjectInDb,
  updateProjectInDb,
  deleteProjectInDb,
  getProjectById,
} from '@/lib/dal/projects.dal'
import { currentUser } from '@/lib/auth'

// --- Schemas ---
const ProjectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  repo_path: z.string().optional(),
  github_path: z.string().optional(),
  status: z.string().optional(),
});

const CreateProjectSchema = ProjectSchema.omit({ status: true });
const UpdateProjectSchema = ProjectSchema.extend({ id: z.string() });


// --- State Types ---
export type FormState = {
  errors?: {
    [key: string]: string[] | undefined;
    name?: string[]
    description?: string[]
    repo_path?: string[]
    github_path?: string[]
    status?: string[]
  }
  message?: string | null
}


// --- Actions ---

export async function createProject(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = CreateProjectSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo crear el proyecto.',
    }
  }

  try {
    await createProjectInDb(validatedFields.data)
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo crear el proyecto.' }
  }

  revalidatePath('/projects')
  redirect(`/projects`)
}


export async function updateProject(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = UpdateProjectSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo actualizar el proyecto.',
    };
  }

  const { id, ...data } = validatedFields.data;

  const project = await getProjectById(id);
  if (!project) return { message: 'Project not found.' };
  if (project.user_id && project.user_id !== user.id) return { message: 'Not authorized.' };

  try {
    await updateProjectInDb(id, data);
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo actualizar el proyecto.' };
  }

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
  redirect(`/projects/${id}`);
}


export async function deleteProject(formData: FormData) {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated.');

    const id = formData.get('id')?.toString();
    if (!id) {
        throw new Error('ID es requerido para borrar.');
    }

    const project = await getProjectById(id);
    if (!project) throw new Error('Project not found.');
    if (project.user_id && project.user_id !== user.id) throw new Error('Not authorized.');

    try {
        await deleteProjectInDb(id);
    } catch (error) {
        throw new Error('Error de base de datos: No se pudo borrar el proyecto.');
    }

    revalidatePath('/projects');
    redirect('/projects');
}

export async function deleteProjectById(id: string): Promise<void> {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated.');

    const project = await getProjectById(id);
    if (!project) throw new Error('Project not found.');
    if (project.user_id && project.user_id !== user.id) throw new Error('Not authorized.');

    await deleteProjectInDb(id);
    revalidatePath('/projects');
    redirect('/projects');
}
