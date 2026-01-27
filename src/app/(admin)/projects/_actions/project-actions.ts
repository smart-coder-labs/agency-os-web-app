'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  createProjectInDb, 
  updateProjectInDb, 
  deleteProjectInDb 
} from '@/lib/dal/projects.dal'

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

  revalidatePath('/admin/projects')
  redirect(`/admin/projects`)
}


export async function updateProject(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = UpdateProjectSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo actualizar el proyecto.',
    };
  }

  const { id, ...data } = validatedFields.data;

  try {
    await updateProjectInDb(id, data);
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo actualizar el proyecto.' };
  }

  revalidatePath(`/admin/projects/${id}`);
  revalidatePath('/admin/projects');
  redirect(`/admin/projects/${id}`);
}


export async function deleteProject(formData: FormData) {
    const id = formData.get('id')?.toString();
    if (!id) {
        // This should ideally return a state object if used in a useFormState context
        throw new Error('ID es requerido para borrar.');
    }

    try {
        await deleteProjectInDb(id);
    } catch (error) {
        // This should also return a state object
        throw new Error('Error de base de datos: No se pudo borrar el proyecto.');
    }

    revalidatePath('/admin/projects');
    redirect('/admin/projects');
}
