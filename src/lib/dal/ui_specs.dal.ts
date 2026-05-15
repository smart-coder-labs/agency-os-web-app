import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export async function getUiSpecByProjectId(project_id: string) {
  const user = await currentUser();
  if (!user) return null;

  const spec = await prisma.ui_specs.findUnique({
    where: { project_id },
    include: { projects: true }
  });

  if (spec && spec.projects && spec.projects.user_id !== user.id) {
    return null;
  }

  return spec;
}

export async function upsertUiSpec(project_id: string, data: any) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  // Verify project ownership
  const project = await prisma.projects.findUnique({ where: { id: project_id } });
  if (!project || project.user_id !== user.id) throw new Error('Forbidden');

  return await prisma.ui_specs.upsert({
    where: { project_id },
    update: data,
    create: { ...data, project_id },
  });
}

export async function deleteUiSpecByProjectId(project_id: string) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  // Verify project ownership
  const project = await prisma.projects.findUnique({ where: { id: project_id } });
  if (!project || project.user_id !== user.id) throw new Error('Forbidden');

  return await prisma.ui_specs.delete({ where: { project_id } });
}
