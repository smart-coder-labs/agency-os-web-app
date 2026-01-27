'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  createStoryInDb, 
  updateStoryInDb, 
  deleteStoryInDb 
} from '@/lib/dal/user_stories.dal'
import { type FormState } from '@/app/(admin)/projects/_actions/project-actions'

// --- Schemas ---
const StorySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  role: z.string().optional(),
  goal: z.string().optional(),
  benefit: z.string().optional(),
  acceptance_criteria: z.any().optional(),
  priority: z.string().optional(),
  status: z.string().optional().default('PENDING'),
  project_id: z.string(),
});

const CreateStorySchema = StorySchema;
const UpdateStorySchema = StorySchema.extend({ id: z.string() });


// --- Actions ---

export async function createStory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreateStorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create story.',
    }
  }

  let storyId = '';
  try {
    const newStory = await createStoryInDb(validatedFields.data);
    storyId = newStory.id;
  } catch (error) {
    return { message: 'Database Error: Failed to create story.' }
  }

  revalidatePath('/admin/user-stories');
  revalidatePath(`/admin/projects/${validatedFields.data.project_id}`);
  redirect(`/admin/user-stories/${storyId}`);
}

export async function updateStory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = UpdateStorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update story.',
    };
  }

  const { id, ...data } = validatedFields.data;

  try {
    await updateStoryInDb(id, data);
  } catch (error) {
    return { message: 'Database Error: Failed to update story.' };
  }

  revalidatePath(`/admin/user-stories/${id}`);
  revalidatePath('/admin/user-stories');
  revalidatePath(`/admin/projects/${data.project_id}`);
  redirect(`/admin/user-stories/${id}`);
}

export async function deleteStory(formData: FormData) {
    const id = formData.get('id')?.toString();
    const projectId = formData.get('project_id')?.toString();

    if (!id || !projectId) {
        throw new Error('ID and Project ID are required for deletion.');
    }

    try {
        await deleteStoryInDb(id);
    } catch (error) {
        throw new Error('Database Error: Failed to delete story.');
    }

    revalidatePath('/admin/user-stories');
    revalidatePath(`/admin/projects/${projectId}`);
    redirect('/admin/user-stories');
}
