import { prisma } from '@/lib/db';

export async function getUiSpecByProjectId(project_id: string) {
  return await prisma.ui_specs.findUnique({ where: { project_id } });
}

export async function upsertUiSpec(project_id: string, data: any) {
  return await prisma.ui_specs.upsert({
    where: { project_id },
    update: data,
    create: { ...data, project_id },
  });
}

export async function deleteUiSpecByProjectId(project_id: string) {
  return await prisma.ui_specs.delete({ where: { project_id } });
}
