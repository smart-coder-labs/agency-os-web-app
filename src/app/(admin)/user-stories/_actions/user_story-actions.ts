'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createStoryInDb,
  updateStoryInDb,
  deleteStoryInDb,
  getStoryById,
} from '@/lib/dal/user_stories.dal'
import { getProjectById } from '@/lib/dal/projects.dal'
import { currentUser } from '@/lib/auth'
import { type FormState } from '@/app/(admin)/projects/_actions/project-actions'
export type { FormState }

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
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = CreateStorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create story.',
    }
  }

  const project = await getProjectById(validatedFields.data.project_id);
  if (!project) return { message: 'Project not found.' };
  if (project.user_id && project.user_id !== user.id) return { message: 'Not authorized.' };

  let storyId = '';
  try {
    const newStory = await createStoryInDb(validatedFields.data);
    storyId = newStory.id;
  } catch (error) {
    return { message: 'Database Error: Failed to create story.' }
  }

  revalidatePath('/user-stories');
  revalidatePath(`/projects/${validatedFields.data.project_id}`);
  redirect(`/user-stories/${storyId}`);
}

export async function updateStory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { message: 'Not authenticated.' };

  const validatedFields = UpdateStorySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update story.',
    };
  }

  const { id, ...data } = validatedFields.data;

  const story = await getStoryById(id);
  if (!story) return { message: 'Story not found.' };
  if (!story.project_id) return { message: 'Story has no associated project.' };
  const project = await getProjectById(story.project_id);
  if (!project) return { message: 'Project not found.' };
  if (project.user_id && project.user_id !== user.id) return { message: 'Not authorized.' };

  try {
    await updateStoryInDb(id, data);
  } catch (error) {
    return { message: 'Database Error: Failed to update story.' };
  }

  revalidatePath(`/user-stories/${id}`);
  revalidatePath('/user-stories');
  revalidatePath(`/projects/${data.project_id}`);
  redirect(`/user-stories/${id}`);
}

export async function deleteStory(formData: FormData) {
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
        await deleteStoryInDb(id);
    } catch (error) {
        throw new Error('Database Error: Failed to delete story.');
    }

    revalidatePath('/user-stories');
    revalidatePath(`/projects/${projectId}`);
    redirect('/user-stories');
}

export async function deleteStoryById(id: string): Promise<void> {
    const user = await currentUser();
    if (!user) throw new Error('Not authenticated.');

    const story = await getStoryById(id);
    if (!story) throw new Error('Story not found.');
    if (!story.project_id) throw new Error('Story has no associated project.');
    const project = await getProjectById(story.project_id);
    if (!project) throw new Error('Project not found.');
    if (project.user_id && project.user_id !== user.id) throw new Error('Not authorized.');

    await deleteStoryInDb(id);
    revalidatePath('/user-stories');
    redirect('/user-stories');
}
